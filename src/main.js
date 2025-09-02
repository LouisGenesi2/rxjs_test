import { ReplaySubject, of, delay, delayWhen, timer, timeInterval, concatMap } from "rxjs";
// import type {TimeInterval} from "rxjs";
const stream$ = of(1, 2, 3).pipe(delayWhen((x) => timer(x * 1000)), timeInterval());
const replay$ = new ReplaySubject();
stream$.subscribe(replay$);
replay$.pipe(concatMap((ev) => of(ev.value).pipe(delay(ev.interval)))).subscribe(console.log);
