/**
 * Immutable view of builtin Set.
 * Note that this allows Set to be passed directly to functions accepting
 * ImmutableSet, but *not* vice versa.
 */
export interface ImmutableSet<A> {
  /** The cardinality of the ImmutableSet */
  readonly size: number
  /** Returns true if and only if `a` is a member of the ImmutableSet */
  has(a: A): boolean
  /** Returns an iterable view of the elements of the ImmutableSet */
  [Symbol.iterator](): Iterator<A>
}

export type ElementType<Set extends ImmutableSet<unknown>> = Set extends ImmutableSet<infer A> ? A : never

/**
 * The canonical empty set
 */
export const empty: ImmutableSet<never> = new Set()

/**
 * Refine to the {@link empty} set
 */
export const isEmpty = <A>(s: ImmutableSet<A>): s is ImmutableSet<never> => s.size === 0

/**
 * Return true if and only if `a` is member of `s`. Membership is determined
 * using the same semantics as {@link Set}.
 */
export const has = <A>(a: A, s: ImmutableSet<A>): boolean => s.has(a)

/**
 * Create an {@link ImmutableSet} containing the provided elements
 */
export const of = <Elements extends readonly unknown[]>(...elements: Elements): ImmutableSet<Elements[number]> =>
  new Set(elements)

export type Union<Sets extends readonly ImmutableSet<unknown>[]> = ElementType<Sets[number]>

/**
 * Return the union of all the provided ImmutableSets: S1 ∪ S2 ∪ S3 ...
 */
export const union = <Sets extends readonly [ImmutableSet<unknown>, ImmutableSet<unknown>, ...readonly ImmutableSet<unknown>[]]>(...sets: Sets): ImmutableSet<Union<Sets>> =>
  new Set(sets.flatMap(s => [...s])) as ImmutableSet<Union<Sets>>

export type Intersection<Sets, R = unknown> =
  Sets extends []
  ? ImmutableSet<R>
  : Sets extends readonly [infer S0 extends ImmutableSet<unknown>, ...infer Tail]
  ? S0 extends ImmutableSet<infer A0>
  ? Intersection<Tail, R & A0>
  : never
  : never

/**
 * Return the intersection of all the provided ImmutableSets: S1 ∩ S2 ∩ S3 ...
 */
export const intersection = <Sets extends readonly [ImmutableSet<unknown>, ImmutableSet<unknown>, ...readonly ImmutableSet<unknown>[]]>(...[s0, ...sets]: Sets): Intersection<Sets> =>
  new Set([...s0].filter(x => sets.every(s => s.has(x)))) as Intersection<Sets>

/**
 * Return the set of all elements in S0 that are not in S1: S0 \ S1
 */
export const difference = <A, B>(s0: ImmutableSet<A>, s1: ImmutableSet<B>): ImmutableSet<A> =>
  new Set([...s0].filter(a => !s1.has(a as any))) as unknown as ImmutableSet<A>

/**
 * Symmetric difference of S0 and S1: (S0 \ S1) ∪ (S1 \ S0)
 */
export const symmetric = <A, B>(s0: ImmutableSet<A>, s1: ImmutableSet<B>): ImmutableSet<A | B> =>
  union(difference(s0, s1), difference(s1, s0))

/**
 * True if and only if S0 and S1 represent the same set of elements. Element
 * equality is determined using the same semantics as {@link Set}.
 */
export const equal = <S0 extends ImmutableSet<unknown>, S1 extends S0>(s0: S0, s1: S1): s0 is S1 =>
  s0 === s1 || (s0.size === s1.size && [...s0].every(x => s1.has(x)))

/**
 * Apply f to all the elements of s
 */
export const map = <A, B>(f: (a: A) => B, s: ImmutableSet<A>): ImmutableSet<B> =>
  new Set([...s].map(f))

/**
 * Retain only the elements for which p is true
 */
export const filter = <A, B extends A>(p: (a: A) => a is B, s: ImmutableSet<A>): ImmutableSet<B> =>
  new Set([...s].filter(p))
