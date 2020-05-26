const compose = (...fns: Middleware[]): unknown =>
    fns.reduceRight(
        (prevFn, nextFn) => (...args) => nextFn(prevFn(...args)),
        (value: unknown) => value,
    );

export default compose;
