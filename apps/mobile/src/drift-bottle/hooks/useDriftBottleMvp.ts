import { useAuth } from "@clerk/clerk-expo";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ApiError,
  type DriftStats,
  consumeSseJsonLines,
  createDriftBottleApi,
  getDriftBottleSseUrl,
} from "../api";
import {
  bottleFromPayload,
  type Bottle,
  type RepliedOutItem,
  type RepliedToMeItem,
  type Tab,
} from "../types";

/** Clerk 在 isSignedIn 刚为 true 时 getToken 可能仍为 null（SDK 已知 race），带 skipCache / 短延迟重试 */
async function resolveClerkSessionJwt(
  getToken: (opts?: { skipCache?: boolean }) => Promise<string | null | undefined>,
): Promise<string | null> {
  const pick = async (opts?: { skipCache?: boolean }) => {
    const v = await getToken(opts);
    return v && v.length > 0 ? v : null;
  };
  let t = await pick();
  if (t) return t;
  t = await pick({ skipCache: true });
  if (t) return t;
  await new Promise((r) => setTimeout(r, 120));
  return pick({ skipCache: true });
}

function normalizeStats(s: DriftStats): DriftStats {
  return {
    ...s,
    receivedReplies: s.receivedReplies ?? 0,
  };
}

type State = {
  activeTab: Tab;
  myBottles: Bottle[];
  favorites: Bottle[];
  draft: string;
  replyDraft: string;
  currentBottle: Bottle | null;
  toast: string;
  serverStats: DriftStats;
  /** 收到他人回复且当前不在「Mine」时点亮 Replies 卡片红点 */
  repliesNotifyDot: boolean;
  catchBusy: boolean;
  repliedOut: RepliedOutItem[];
  repliedToMe: RepliedToMeItem[];
};

type Action =
  | { type: "SET_TAB"; payload: Tab }
  | { type: "SET_DRAFT"; payload: string }
  | { type: "SET_REPLY_DRAFT"; payload: string }
  | { type: "SET_TOAST"; payload: string }
  | { type: "CLEAR_TOAST" }
  | { type: "PICK_BOTTLE"; payload: Bottle | null }
  | { type: "SET_SERVER_STATS"; payload: State["serverStats"] }
  | { type: "PATCH_STATS"; payload: Partial<DriftStats> }
  | { type: "SET_MY_BOTTLES"; payload: Bottle[] }
  | { type: "SET_FAVORITES"; payload: Bottle[] }
  | { type: "SET_CATCH_BUSY"; payload: boolean }
  | { type: "SET_REPLIES_DOT"; payload: boolean }
  | { type: "SET_REPLIED_OUT"; payload: RepliedOutItem[] }
  | { type: "SET_REPLIED_TO_ME"; payload: RepliedToMeItem[] };

const initialState: State = {
  activeTab: "sea",
  myBottles: [],
  favorites: [],
  draft: "",
  replyDraft: "",
  currentBottle: null,
  toast: "",
  serverStats: { thrown: 0, favorite: 0, replied: 0, receivedReplies: 0 },
  repliesNotifyDot: false,
  catchBusy: false,
  repliedOut: [],
  repliedToMe: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_TAB":
      return {
        ...state,
        activeTab: action.payload,
        repliesNotifyDot: action.payload === "mine" ? false : state.repliesNotifyDot,
      };
    case "SET_DRAFT":
      return { ...state, draft: action.payload };
    case "SET_REPLY_DRAFT":
      return { ...state, replyDraft: action.payload };
    case "SET_TOAST":
      return { ...state, toast: action.payload };
    case "CLEAR_TOAST":
      return { ...state, toast: "" };
    case "PICK_BOTTLE":
      return { ...state, currentBottle: action.payload, replyDraft: "" };
    case "SET_SERVER_STATS":
      return { ...state, serverStats: normalizeStats(action.payload) };
    case "PATCH_STATS":
      return {
        ...state,
        serverStats: normalizeStats({ ...state.serverStats, ...action.payload }),
      };
    case "SET_MY_BOTTLES":
      return { ...state, myBottles: action.payload };
    case "SET_FAVORITES":
      return { ...state, favorites: action.payload };
    case "SET_CATCH_BUSY":
      return { ...state, catchBusy: action.payload };
    case "SET_REPLIES_DOT":
      return { ...state, repliesNotifyDot: action.payload };
    case "SET_REPLIED_OUT":
      return { ...state, repliedOut: action.payload };
    case "SET_REPLIED_TO_ME":
      return { ...state, repliedToMe: action.payload };
    default:
      return state;
  }
}

export function useDriftBottleMvp() {
  const { t } = useTranslation();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  // Clerk 的 getToken 引用可能在每次渲染变化；若放进 useMemo 依赖会导致 api → refreshAll → useEffect 死循环请求。
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const api = useMemo(
    () =>
      createDriftBottleApi(async () =>
        resolveClerkSessionJwt((opts) => getTokenRef.current(opts)),
      ),
    [],
  );

  const [state, dispatch] = useReducer(reducer, initialState);

  const showToast = useCallback((message: string) => {
    dispatch({ type: "SET_TOAST", payload: message });
    setTimeout(() => dispatch({ type: "CLEAR_TOAST" }), 1600);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [stats, mine, favs, repliedOut, repliedToMe] = await Promise.all([
        api.getStats(),
        api.listMine(),
        api.listFavorites(),
        api.listRepliedByMe(),
        api.listRepliesToMyBottles(),
      ]);
      dispatch({ type: "SET_SERVER_STATS", payload: stats });
      dispatch({
        type: "SET_MY_BOTTLES",
        payload: mine.map(bottleFromPayload),
      });
      dispatch({
        type: "SET_FAVORITES",
        payload: favs.map(bottleFromPayload),
      });
      dispatch({ type: "SET_REPLIED_OUT", payload: repliedOut });
      dispatch({ type: "SET_REPLIED_TO_ME", payload: repliedToMe });
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : t("drift.toast.loadFailed");
      showToast(msg);
    }
  }, [api, showToast, t]);

  /** 仅刷新统计与收藏列表（避免每次收藏都打整套接口） */
  const refreshStatsAndFavorites = useCallback(async () => {
    try {
      const [stats, favs] = await Promise.all([api.getStats(), api.listFavorites()]);
      dispatch({ type: "SET_SERVER_STATS", payload: stats });
      dispatch({ type: "SET_FAVORITES", payload: favs.map(bottleFromPayload) });
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : t("drift.toast.loadFavoritesFailed");
      showToast(msg);
    }
  }, [api, showToast, t]);

  /** 仅刷新统计与“我回复过的海友”列表 */
  const refreshStatsAndRepliedOut = useCallback(async () => {
    try {
      const [stats, repliedOut] = await Promise.all([api.getStats(), api.listRepliedByMe()]);
      dispatch({ type: "SET_SERVER_STATS", payload: stats });
      dispatch({ type: "SET_REPLIED_OUT", payload: repliedOut });
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : t("drift.toast.loadRepliesFailed");
      showToast(msg);
    }
  }, [api, showToast, t]);

  /** 仅刷新“回复我的”弹层所需数据 */
  const refreshRepliedToMe = useCallback(async () => {
    try {
      const repliedToMe = await api.listRepliesToMyBottles();
      dispatch({ type: "SET_REPLIED_TO_ME", payload: repliedToMe });
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : t("drift.toast.loadReceivedFailed");
      showToast(msg);
    }
  }, [api, showToast, t]);

  /** 仅同步顶部统计 +「我的瓶子」；投递成功后收藏列表不会变，不必再打 favorites */
  const refreshStatsAndMine = useCallback(async () => {
    try {
      const [stats, mine] = await Promise.all([api.getStats(), api.listMine()]);
      dispatch({ type: "SET_SERVER_STATS", payload: stats });
      dispatch({
        type: "SET_MY_BOTTLES",
        payload: mine.map(bottleFromPayload),
      });
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : t("drift.toast.loadFailed");
      showToast(msg);
    }
  }, [api, showToast, t]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;
    void refreshAll();
  }, [isLoaded, isSignedIn, userId, refreshAll]);

  const activeTabRef = useRef(state.activeTab);
  activeTabRef.current = state.activeTab;

  // 防止用户连点发送导致重复请求/重复 toast
  const replyInFlightRef = useRef(false);

  /** SSE：他人回复我的瓶子时更新 receivedReplies，并在非 Mine 页显示红点 */
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let abortCurrent: (() => void) | undefined;

    const applyEvent = (raw: string) => {
      try {
        const data = JSON.parse(raw) as {
          type?: string;
          receivedReplies?: number;
        };
        if (data?.type === "stats" && typeof data.receivedReplies === "number") {
          dispatch({
            type: "PATCH_STATS",
            payload: { receivedReplies: data.receivedReplies },
          });
          if (activeTabRef.current !== "mine") {
            dispatch({ type: "SET_REPLIES_DOT", payload: true });
          }
        }
      } catch {
        /* ignore malformed */
      }
    };

    const loop = async () => {
      while (!cancelled) {
        const token = await resolveClerkSessionJwt((opts) =>
          getTokenRef.current(opts),
        );
        if (!token || cancelled) return;

        const ac = new AbortController();
        abortCurrent = () => ac.abort();
        const url = getDriftBottleSseUrl(token);
        try {
          await consumeSseJsonLines(url, applyEvent, ac.signal);
        } catch {
          /* 断开 / 401 / 网络错误，稍后重连 */
        }
        abortCurrent = undefined;
        if (cancelled) return;
        await new Promise<void>((resolve) => {
          retryTimer = setTimeout(resolve, 2500);
        });
      }
    };

    void loop();

    return () => {
      cancelled = true;
      abortCurrent?.();
      if (retryTimer !== undefined) clearTimeout(retryTimer);
    };
  }, [isLoaded, isSignedIn, userId]);

  const setActiveTab = useCallback((tab: Tab) => {
    dispatch({ type: "SET_TAB", payload: tab });
  }, []);

  const setDraft = useCallback((value: string) => {
    dispatch({ type: "SET_DRAFT", payload: value });
  }, []);

  const setReplyDraft = useCallback((value: string) => {
    dispatch({ type: "SET_REPLY_DRAFT", payload: value });
  }, []);

  const throwBottle = useCallback(async () => {
    const content = state.draft.trim();
    if (!content) {
      showToast(t("drift.toast.writeBeforeDrop"));
      return;
    }
    try {
      await api.createBottle(content);
      dispatch({ type: "SET_DRAFT", payload: "" });
      dispatch({ type: "SET_TAB", payload: "mine" });
      await refreshStatsAndMine();
      showToast(t("drift.toast.dropped"));
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : t("drift.toast.dropFailed");
      showToast(msg);
    }
  }, [api, refreshStatsAndMine, showToast, state.draft, t]);

  const catchRandomBottle = useCallback(async () => {
    dispatch({ type: "SET_CATCH_BUSY", payload: true });
    try {
      const { bottle } = await api.catchRandom();
      dispatch({
        type: "PICK_BOTTLE",
        payload: bottle ? bottleFromPayload(bottle) : null,
      });
      if (!bottle) {
        showToast(t("drift.toast.noBottles"));
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : t("drift.toast.catchFailed");
      showToast(msg);
    } finally {
      dispatch({ type: "SET_CATCH_BUSY", payload: false });
    }
  }, [api, showToast, t]);

  const toggleFavorite = useCallback(
    async (bottle: Bottle) => {
      const isSaved = state.favorites.some((f) => f.id === bottle.id);
      try {
        if (isSaved) {
          await api.removeFavorite(bottle.id);
          showToast(t("drift.toast.removedFavorite"));
        } else {
          await api.addFavorite(bottle.id);
          showToast(t("drift.toast.addedFavorite"));
        }
        await refreshStatsAndFavorites();
      } catch (e) {
        if (e instanceof ApiError && e.status === 409 && !isSaved) {
          showToast(t("drift.toast.alreadyFavorite"));
          await refreshStatsAndFavorites();
          return;
        }
        if (e instanceof ApiError && e.status === 404 && isSaved) {
          showToast(t("drift.toast.favoriteStale"));
          await refreshStatsAndFavorites();
          return;
        }
        const msg = e instanceof ApiError ? e.message : t("drift.toast.actionFailed");
        showToast(msg);
      }
    },
    [api, refreshStatsAndFavorites, showToast, state.favorites, t],
  );

  type ReplyMode = "repliedOut" | "repliedToMe";

  const replyToBottleInternal = useCallback(
    async (bottleId: string, content: string, mode: ReplyMode) => {
      if (replyInFlightRef.current) return;
      replyInFlightRef.current = true;

      try {
        const trimmed = content.trim();
        if (!trimmed) {
          showToast(t("drift.toast.replyEmpty"));
          return;
        }

        if (mode === "repliedOut") {
          await api.addReply(bottleId, trimmed);
          // 海洋里回复成功后立即收起瓶子卡片，避免仍占满一屏
          dispatch({ type: "PICK_BOTTLE", payload: null });
          await refreshStatsAndRepliedOut();
        } else {
          await api.addReply(bottleId, trimmed);
          // 在「回复我的」里追加回复只会影响我发出的回复展示（他人回复口径不变）
          await refreshRepliedToMe();
        }

        showToast(t("drift.toast.replySent"));
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : t("drift.toast.replyFailed");
        showToast(msg);
      } finally {
        replyInFlightRef.current = false;
      }
    },
    [
      api,
      refreshStatsAndRepliedOut,
      refreshRepliedToMe,
      showToast,
      t,
    ],
  );

  const sendReply = useCallback(async () => {
    if (!state.currentBottle) return;
    void replyToBottleInternal(state.currentBottle.id, state.replyDraft, "repliedOut");
  }, [replyToBottleInternal, state.currentBottle, state.replyDraft]);

  const sendReplyToBottle = useCallback(
    async (bottleId: string, content: string) => {
      void replyToBottleInternal(bottleId, content, "repliedToMe");
    },
    [replyToBottleInternal],
  );

  return {
    state,
    stats: state.serverStats,
    repliedOut: state.repliedOut,
    repliedToMe: state.repliedToMe,
    actions: {
      setActiveTab,
      setDraft,
      setReplyDraft,
      throwBottle,
      catchRandomBottle,
      toggleFavorite,
      sendReply,
      sendReplyToBottle,
      refreshAll,
    },
  };
}
