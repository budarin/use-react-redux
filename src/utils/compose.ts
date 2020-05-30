const compose = (...fns: Function[]) =>
    fns.reduceRight(
        (prevFn, nextFn) => (...args: any) => nextFn(prevFn(...args)),
        (value: any) => value,
    );

export default compose;
