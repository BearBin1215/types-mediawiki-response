/**
 * Type helpers for `*.test-d.ts` assertions.
 */

/**
 * Keys present on `T` (distributed over unions) that are not in `Known`.
 *
 * Assert this equals `never` to catch response fields a fixture carries but the
 * declared type omits. Bounded by fixture coverage: only keys the fixture
 * actually contains are checked, so pair it with the `paraminfo` enum checklist.
 */
export type ExtraKeys<T, Known extends PropertyKey> = T extends unknown
  ? Exclude<keyof T, Known>
  : never;
