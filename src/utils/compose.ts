// @ts-nocheck
const compose = (...fns) =>
    fns.reduceRight(
        (prevFn, nextFn) => (...args) => nextFn(prevFn(...args)),
        (value) => value,
    );

export default compose;
