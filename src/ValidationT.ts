import {
  ApplicativeComposition02C,
  ApplicativeComposition12C,
  ApplicativeComposition22C,
  getApplicativeComposition
} from './Applicative'
import { Either, getValidation, isLeft, isRight, left, URI } from './Either'
import { HKT, Type, Type2, URIS, URIS2 } from './HKT'
import { Monad, Monad1, Monad2 } from './Monad'
import { Semigroup } from './Semigroup'

/**
 * @since 2.0.0
 */
export interface ValidationT<M, E, A> extends HKT<M, Either<E, A>> {}

/**
 * @since 2.0.0
 */
export interface ValidationM<M, E> extends ApplicativeComposition02C<M, URI, E> {
  readonly chain: <A, B>(ma: ValidationT<M, E, A>, f: (a: A) => ValidationT<M, E, B>) => ValidationT<M, E, B>
  readonly alt: <A>(fx: ValidationT<M, E, A>, f: () => ValidationT<M, E, A>) => ValidationT<M, E, A>
}

/**
 * @since 2.0.0
 */
export type ValidationT1<M extends URIS, E, A> = Type<M, Either<E, A>>

/**
 * @since 2.0.0
 */
export interface ValidationM1<M extends URIS, E> extends ApplicativeComposition12C<M, URI, E> {
  readonly chain: <A, B>(ma: ValidationT1<M, E, A>, f: (a: A) => ValidationT1<M, E, B>) => ValidationT1<M, E, B>
  readonly alt: <A>(fx: ValidationT1<M, E, A>, f: () => ValidationT1<M, E, A>) => ValidationT1<M, E, A>
}

/**
 * @since 2.0.0
 */
export type ValidationT2<M extends URIS2, L, E, A> = Type2<M, L, Either<E, A>>

/**
 * @since 2.0.0
 */
export interface ValidationM2<M extends URIS2, E> extends ApplicativeComposition22C<M, URI, E> {
  readonly chain: <L, A, B>(
    ma: ValidationT2<M, L, E, A>,
    f: (a: A) => ValidationT2<M, L, E, B>
  ) => ValidationT2<M, L, E, B>
  readonly alt: <L, A>(fx: ValidationT2<M, L, E, A>, f: () => ValidationT2<M, L, E, A>) => ValidationT2<M, L, E, A>
}

/**
 * @since 2.0.0
 */
export function getValidationM<E, M extends URIS2>(S: Semigroup<E>, M: Monad2<M>): ValidationM2<M, E>
export function getValidationM<E, M extends URIS>(S: Semigroup<E>, M: Monad1<M>): ValidationM1<M, E>
export function getValidationM<E, M>(S: Semigroup<E>, M: Monad<M>): ValidationM<M, E>
export function getValidationM<E, M>(S: Semigroup<E>, M: Monad<M>): ValidationM<M, E> {
  const A = getApplicativeComposition(M, getValidation(S))

  return {
    ...A,
    chain: (ma, f) => M.chain(ma, e => (isLeft(e) ? M.of(left(e.left)) : f(e.right))),
    alt: (fx, f) =>
      M.chain(fx, e1 =>
        isRight(e1) ? A.of(e1.right) : M.map(f(), e2 => (isLeft(e2) ? left(S.concat(e1.left, e2.left)) : e2))
      )
  }
}
