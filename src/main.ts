import {ReplaySubject, of, from, delay, delayWhen, timer, Subject, timeInterval, concatMap, TimeInterval, fromEvent, filter, switchMap, share, startWith, scan, Observable} from "rxjs";
// import type {TimeInterval} from "rxjs";

const restart$ = fromEvent<KeyboardEvent>(document, "keypress").pipe(filter(ev => ev.key === 'r'), share())

const stream$ = restart$.pipe(
    startWith(0),
    scan((acc, val) => acc + 1, 0),
    switchMap(runId =>
        of(1*runId,2*runId,3*runId).pipe(
            delayWhen((x: number) => timer((x/runId)*1000)),
            timeInterval(),
        )
    )
)

const replays$ = new ReplaySubject<Observable<TimeInterval<number>>>();

stream$.subscribe(replays$);

replays$.pipe(
    scan((acc, val) => {
        const newRun$ = new ReplaySubject<TimeInterval<number>>();
        val.subscribe(newRun$);
        return [...acc, newRun$];
    }, [] as ReplaySubject<TimeInterval<number>>[]
    ),
    //concatMap((ev: TimeInterval<number>) => of(ev.value).pipe(delay(ev.interval)))
).subscribe(console.log);


