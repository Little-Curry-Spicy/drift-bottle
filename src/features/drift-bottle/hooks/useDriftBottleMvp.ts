import { useCallback, useMemo, useReducer } from "react";
import { seedBottles } from "../constants";
import type { Bottle, Mood, Tab } from "../types";

type State = {
  activeTab: Tab;
  seaBottles: Bottle[];
  myBottles: Bottle[];
  favorites: Bottle[];
  draft: string;
  selectedMood: Mood;
  replyDraft: string;
  currentBottle: Bottle | null;
  toast: string;
};

type Action =
  | { type: "SET_TAB"; payload: Tab }
  | { type: "SET_DRAFT"; payload: string }
  | { type: "SET_MOOD"; payload: Mood }
  | { type: "SET_REPLY_DRAFT"; payload: string }
  | { type: "SET_TOAST"; payload: string }
  | { type: "CLEAR_TOAST" }
  | { type: "PICK_BOTTLE"; payload: Bottle | null }
  | { type: "THROW_BOTTLE"; payload: Bottle }
  | { type: "ADD_FAVORITE"; payload: Bottle }
  | { type: "ADD_REPLY"; payload: { bottleId: string; content: string } };

const initialState: State = {
  activeTab: "sea",
  seaBottles: seedBottles,
  myBottles: [],
  favorites: [],
  draft: "",
  selectedMood: "期待",
  replyDraft: "",
  currentBottle: null,
  toast: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_DRAFT":
      return { ...state, draft: action.payload };
    case "SET_MOOD":
      return { ...state, selectedMood: action.payload };
    case "SET_REPLY_DRAFT":
      return { ...state, replyDraft: action.payload };
    case "SET_TOAST":
      return { ...state, toast: action.payload };
    case "CLEAR_TOAST":
      return { ...state, toast: "" };
    case "PICK_BOTTLE":
      return { ...state, currentBottle: action.payload, replyDraft: "" };
    case "THROW_BOTTLE":
      return {
        ...state,
        seaBottles: [action.payload, ...state.seaBottles],
        myBottles: [action.payload, ...state.myBottles],
        draft: "",
        activeTab: "mine",
      };
    case "ADD_FAVORITE": {
      if (state.favorites.some((item) => item.id === action.payload.id)) return state;
      return { ...state, favorites: [action.payload, ...state.favorites] };
    }
    case "ADD_REPLY": {
      const nextSeaBottles = state.seaBottles.map((item) =>
        item.id === action.payload.bottleId
          ? { ...item, replies: [...item.replies, action.payload.content] }
          : item,
      );
      const nextCurrentBottle =
        state.currentBottle && state.currentBottle.id === action.payload.bottleId
          ? {
              ...state.currentBottle,
              replies: [...state.currentBottle.replies, action.payload.content],
            }
          : state.currentBottle;
      return {
        ...state,
        seaBottles: nextSeaBottles,
        currentBottle: nextCurrentBottle,
        replyDraft: "",
      };
    }
    default:
      return state;
  }
}

export function useDriftBottleMvp() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const stats = useMemo(
    () => ({
      thrown: state.myBottles.length,
      favorite: state.favorites.length,
      replied: state.seaBottles.reduce(
        (count, bottle) => count + bottle.replies.length,
        0,
      ),
    }),
    [state.myBottles.length, state.favorites.length, state.seaBottles],
  );

  const showToast = useCallback((message: string) => {
    dispatch({ type: "SET_TOAST", payload: message });
    setTimeout(() => dispatch({ type: "CLEAR_TOAST" }), 1600);
  }, []);

  const setActiveTab = useCallback((tab: Tab) => {
    dispatch({ type: "SET_TAB", payload: tab });
  }, []);

  const setDraft = useCallback((value: string) => {
    dispatch({ type: "SET_DRAFT", payload: value });
  }, []);

  const setSelectedMood = useCallback((mood: Mood) => {
    dispatch({ type: "SET_MOOD", payload: mood });
  }, []);

  const setReplyDraft = useCallback((value: string) => {
    dispatch({ type: "SET_REPLY_DRAFT", payload: value });
  }, []);

  const throwBottle = useCallback(() => {
    const content = state.draft.trim();
    if (!content) {
      showToast("先写点内容再扔出去");
      return;
    }

    const bottle: Bottle = {
      id: `my-${Date.now()}`,
      content,
      mood: state.selectedMood,
      author: "我",
      replies: [],
      createdAt: "刚刚",
    };
    dispatch({ type: "THROW_BOTTLE", payload: bottle });
    showToast("漂流瓶已扔进海里");
  }, [state.draft, state.selectedMood, showToast]);

  const catchRandomBottle = useCallback(() => {
    const strangers = state.seaBottles.filter((item) => item.author === "陌生人");
    if (!strangers.length) {
      dispatch({ type: "PICK_BOTTLE", payload: null });
      showToast("海里暂时没有新瓶子");
      return;
    }
    const picked = strangers[Math.floor(Math.random() * strangers.length)];
    dispatch({ type: "PICK_BOTTLE", payload: picked });
  }, [state.seaBottles, showToast]);

  const addFavorite = useCallback(
    (bottle: Bottle) => {
      if (state.favorites.some((item) => item.id === bottle.id)) {
        showToast("已经收藏过了");
        return;
      }
      dispatch({ type: "ADD_FAVORITE", payload: bottle });
      showToast("收藏成功");
    },
    [state.favorites, showToast],
  );

  const sendReply = useCallback(() => {
    if (!state.currentBottle) return;
    const content = state.replyDraft.trim();
    if (!content) {
      showToast("回复内容不能为空");
      return;
    }
    dispatch({
      type: "ADD_REPLY",
      payload: { bottleId: state.currentBottle.id, content },
    });
    showToast("已送出回复");
  }, [state.currentBottle, state.replyDraft, showToast]);

  return {
    state,
    stats,
    actions: {
      setActiveTab,
      setDraft,
      setSelectedMood,
      setReplyDraft,
      throwBottle,
      catchRandomBottle,
      addFavorite,
      sendReply,
    },
  };
}
