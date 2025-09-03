import { run } from "node:test";
import {ReplaySubject, of, from, delay, delayWhen, timer, Subject, timeInterval, concatMap, TimeInterval, fromEvent, filter, switchMap, share, startWith, scan, Observable, map, shareReplay, mergeMap, timestamp, tap, Timestamp, merge} from "rxjs";
// import type {TimeInterval} from "rxjs";

type ReplayAndRun = {
    runReplay: ReplaySubject<Run>;
    run: Observable<Run>;
}

type Run = {
    runId: number;
    value: timeTaken;
}

type timeTaken = {
    timeTaken: number;
    value: number;
}

const restart$ = fromEvent<KeyboardEvent>(document, "keypress").pipe(filter(ev => ev.key === 'r'), share())

const stream$: Observable<ReplayAndRun> = restart$.pipe(
    startWith(0),
    scan((acc, val) => acc + 1, 0),
    switchMap(runId => {
            const newReplay$ = new ReplaySubject<Run>();

            const run$: Observable<Run> = of(1+runId*3,2+runId*3,3+runId*3).pipe(
                timestamp(),
                tap(x => x),
                delayWhen((x: Timestamp<number>) => timer((x.value-runId*3)*1000)),
                timestamp(),
                map((x: Timestamp<Timestamp<number>>): timeTaken => ({timeTaken: x.timestamp - x.value.timestamp, value: x.value.value})),
                map(val => ({runId: runId, value: val}) as const),
                shareReplay()
            )

            run$.subscribe(newReplay$);

            return of({runReplay: newReplay$, run: run$})
        }
    ),
    shareReplay()
)

const replays$ = new ReplaySubject<ReplayAndRun>();

stream$.subscribe(replays$);

const createDelayedObservable = (value: number, delayInput: number): Observable<number> => {
    return of(value).pipe(delay(delayInput))
}


replays$.pipe(
    scan((acc, val) => [...acc, val.runReplay], [] as ReplaySubject<Run>[]),
    mergeMap((replays: ReplaySubject<Run>[]) => replays), // Flatten the array
    switchMap(replay$ => replay$), // Switch to the replay's emissions
    mergeMap((val) => createDelayedObservable(val.value.value, val.value.timeTaken))
).subscribe(console.log)

// replays$.pipe(
//     scan((acc, val) => [...acc, val.runReplay], [] as ReplaySubject<Run>[]),
//     switchMap((allReplays: ReplaySubject<Run>[]) => 
//         merge(
//             ...allReplays.map(replay => 
//                 replay.pipe(
//                     mergeMap(val => 
//                         timer(val.value.timeTaken).pipe(
//                             map(() => val.value.value)
//                         )
//                     )
//                 )
//             )
//         )
//     )
// ).subscribe(console.log)


// replays$.pipe(
//     scan((acc, val) => [...acc, val.runReplay], [] as ReplaySubject<Run>[]),
//     concatMap((replays: ReplaySubject<Run>[]) => replays.map(replay$ => replay$)),
// ).subscribe((replay$) => replay$.pipe(
//         map((val) => createDelayedObservable(val.value.value, val.value.interval))
//     ).subscribe((finalReplay$ ) => finalReplay$.subscribe(console.log))
// )





// WORST
// replays$.pipe(
//     scan((acc, val) => {
//         const newRun$ = new ReplaySubject<TimeInterval<number>>();
//         val.subscribe(newRun$);
//         return [...acc, newRun$];
//     }, [] as ReplaySubject<TimeInterval<number>>[]
//     ),
//     //concatMap((ev: TimeInterval<number>) => of(ev.value).pipe(delay(ev.interval)))
// ).subscribe(console.log);


