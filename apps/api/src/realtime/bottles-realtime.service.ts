import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

/** SSE 多路广播：同一 userId 可有多条连接（多标签），推送时全部收到 */
@Injectable()
export class BottlesRealtimeService {
  private readonly hubs = new Map<string, Subject<MessageEvent>>();

  private subjectFor(userId: string): Subject<MessageEvent> {
    let s = this.hubs.get(userId);
    if (!s) {
      s = new Subject<MessageEvent>();
      this.hubs.set(userId, s);
    }
    return s;
  }

  stream(userId: string): Observable<MessageEvent> {
    return this.subjectFor(userId).asObservable();
  }

  /** 他人回复了 userId 的瓶子时推送最新「收到的回复」条数 */
  notifyReceivedReplies(userId: string, receivedReplies: number) {
    this.subjectFor(userId).next({
      data: JSON.stringify({ type: 'stats', receivedReplies }),
    });
  }
}
