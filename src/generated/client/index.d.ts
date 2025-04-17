
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Problem
 * 
 */
export type Problem = $Result.DefaultSelection<Prisma.$ProblemPayload>
/**
 * Model TopicTag
 * 
 */
export type TopicTag = $Result.DefaultSelection<Prisma.$TopicTagPayload>
/**
 * Model ProblemsOnTopicTags
 * 
 */
export type ProblemsOnTopicTags = $Result.DefaultSelection<Prisma.$ProblemsOnTopicTagsPayload>
/**
 * Model SheetProblem
 * 
 */
export type SheetProblem = $Result.DefaultSelection<Prisma.$SheetProblemPayload>
/**
 * Model Sheet
 * 
 */
export type Sheet = $Result.DefaultSelection<Prisma.$SheetPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Problems
 * const problems = await prisma.problem.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Problems
   * const problems = await prisma.problem.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.problem`: Exposes CRUD operations for the **Problem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Problems
    * const problems = await prisma.problem.findMany()
    * ```
    */
  get problem(): Prisma.ProblemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.topicTag`: Exposes CRUD operations for the **TopicTag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TopicTags
    * const topicTags = await prisma.topicTag.findMany()
    * ```
    */
  get topicTag(): Prisma.TopicTagDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.problemsOnTopicTags`: Exposes CRUD operations for the **ProblemsOnTopicTags** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProblemsOnTopicTags
    * const problemsOnTopicTags = await prisma.problemsOnTopicTags.findMany()
    * ```
    */
  get problemsOnTopicTags(): Prisma.ProblemsOnTopicTagsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sheetProblem`: Exposes CRUD operations for the **SheetProblem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SheetProblems
    * const sheetProblems = await prisma.sheetProblem.findMany()
    * ```
    */
  get sheetProblem(): Prisma.SheetProblemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sheet`: Exposes CRUD operations for the **Sheet** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sheets
    * const sheets = await prisma.sheet.findMany()
    * ```
    */
  get sheet(): Prisma.SheetDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.6.0
   * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Problem: 'Problem',
    TopicTag: 'TopicTag',
    ProblemsOnTopicTags: 'ProblemsOnTopicTags',
    SheetProblem: 'SheetProblem',
    Sheet: 'Sheet'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "problem" | "topicTag" | "problemsOnTopicTags" | "sheetProblem" | "sheet"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Problem: {
        payload: Prisma.$ProblemPayload<ExtArgs>
        fields: Prisma.ProblemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProblemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProblemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>
          }
          findFirst: {
            args: Prisma.ProblemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProblemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>
          }
          findMany: {
            args: Prisma.ProblemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>[]
          }
          create: {
            args: Prisma.ProblemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>
          }
          createMany: {
            args: Prisma.ProblemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProblemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>[]
          }
          delete: {
            args: Prisma.ProblemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>
          }
          update: {
            args: Prisma.ProblemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>
          }
          deleteMany: {
            args: Prisma.ProblemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProblemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProblemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>[]
          }
          upsert: {
            args: Prisma.ProblemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>
          }
          aggregate: {
            args: Prisma.ProblemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProblem>
          }
          groupBy: {
            args: Prisma.ProblemGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProblemGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProblemCountArgs<ExtArgs>
            result: $Utils.Optional<ProblemCountAggregateOutputType> | number
          }
        }
      }
      TopicTag: {
        payload: Prisma.$TopicTagPayload<ExtArgs>
        fields: Prisma.TopicTagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TopicTagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicTagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TopicTagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicTagPayload>
          }
          findFirst: {
            args: Prisma.TopicTagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicTagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TopicTagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicTagPayload>
          }
          findMany: {
            args: Prisma.TopicTagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicTagPayload>[]
          }
          create: {
            args: Prisma.TopicTagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicTagPayload>
          }
          createMany: {
            args: Prisma.TopicTagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TopicTagCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicTagPayload>[]
          }
          delete: {
            args: Prisma.TopicTagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicTagPayload>
          }
          update: {
            args: Prisma.TopicTagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicTagPayload>
          }
          deleteMany: {
            args: Prisma.TopicTagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TopicTagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TopicTagUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicTagPayload>[]
          }
          upsert: {
            args: Prisma.TopicTagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicTagPayload>
          }
          aggregate: {
            args: Prisma.TopicTagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTopicTag>
          }
          groupBy: {
            args: Prisma.TopicTagGroupByArgs<ExtArgs>
            result: $Utils.Optional<TopicTagGroupByOutputType>[]
          }
          count: {
            args: Prisma.TopicTagCountArgs<ExtArgs>
            result: $Utils.Optional<TopicTagCountAggregateOutputType> | number
          }
        }
      }
      ProblemsOnTopicTags: {
        payload: Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>
        fields: Prisma.ProblemsOnTopicTagsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProblemsOnTopicTagsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemsOnTopicTagsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProblemsOnTopicTagsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemsOnTopicTagsPayload>
          }
          findFirst: {
            args: Prisma.ProblemsOnTopicTagsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemsOnTopicTagsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProblemsOnTopicTagsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemsOnTopicTagsPayload>
          }
          findMany: {
            args: Prisma.ProblemsOnTopicTagsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemsOnTopicTagsPayload>[]
          }
          create: {
            args: Prisma.ProblemsOnTopicTagsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemsOnTopicTagsPayload>
          }
          createMany: {
            args: Prisma.ProblemsOnTopicTagsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProblemsOnTopicTagsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemsOnTopicTagsPayload>[]
          }
          delete: {
            args: Prisma.ProblemsOnTopicTagsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemsOnTopicTagsPayload>
          }
          update: {
            args: Prisma.ProblemsOnTopicTagsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemsOnTopicTagsPayload>
          }
          deleteMany: {
            args: Prisma.ProblemsOnTopicTagsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProblemsOnTopicTagsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProblemsOnTopicTagsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemsOnTopicTagsPayload>[]
          }
          upsert: {
            args: Prisma.ProblemsOnTopicTagsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemsOnTopicTagsPayload>
          }
          aggregate: {
            args: Prisma.ProblemsOnTopicTagsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProblemsOnTopicTags>
          }
          groupBy: {
            args: Prisma.ProblemsOnTopicTagsGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProblemsOnTopicTagsGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProblemsOnTopicTagsCountArgs<ExtArgs>
            result: $Utils.Optional<ProblemsOnTopicTagsCountAggregateOutputType> | number
          }
        }
      }
      SheetProblem: {
        payload: Prisma.$SheetProblemPayload<ExtArgs>
        fields: Prisma.SheetProblemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SheetProblemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetProblemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SheetProblemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetProblemPayload>
          }
          findFirst: {
            args: Prisma.SheetProblemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetProblemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SheetProblemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetProblemPayload>
          }
          findMany: {
            args: Prisma.SheetProblemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetProblemPayload>[]
          }
          create: {
            args: Prisma.SheetProblemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetProblemPayload>
          }
          createMany: {
            args: Prisma.SheetProblemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SheetProblemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetProblemPayload>[]
          }
          delete: {
            args: Prisma.SheetProblemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetProblemPayload>
          }
          update: {
            args: Prisma.SheetProblemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetProblemPayload>
          }
          deleteMany: {
            args: Prisma.SheetProblemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SheetProblemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SheetProblemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetProblemPayload>[]
          }
          upsert: {
            args: Prisma.SheetProblemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetProblemPayload>
          }
          aggregate: {
            args: Prisma.SheetProblemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSheetProblem>
          }
          groupBy: {
            args: Prisma.SheetProblemGroupByArgs<ExtArgs>
            result: $Utils.Optional<SheetProblemGroupByOutputType>[]
          }
          count: {
            args: Prisma.SheetProblemCountArgs<ExtArgs>
            result: $Utils.Optional<SheetProblemCountAggregateOutputType> | number
          }
        }
      }
      Sheet: {
        payload: Prisma.$SheetPayload<ExtArgs>
        fields: Prisma.SheetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SheetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SheetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetPayload>
          }
          findFirst: {
            args: Prisma.SheetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SheetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetPayload>
          }
          findMany: {
            args: Prisma.SheetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetPayload>[]
          }
          create: {
            args: Prisma.SheetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetPayload>
          }
          createMany: {
            args: Prisma.SheetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SheetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetPayload>[]
          }
          delete: {
            args: Prisma.SheetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetPayload>
          }
          update: {
            args: Prisma.SheetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetPayload>
          }
          deleteMany: {
            args: Prisma.SheetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SheetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SheetUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetPayload>[]
          }
          upsert: {
            args: Prisma.SheetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SheetPayload>
          }
          aggregate: {
            args: Prisma.SheetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSheet>
          }
          groupBy: {
            args: Prisma.SheetGroupByArgs<ExtArgs>
            result: $Utils.Optional<SheetGroupByOutputType>[]
          }
          count: {
            args: Prisma.SheetCountArgs<ExtArgs>
            result: $Utils.Optional<SheetCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    problem?: ProblemOmit
    topicTag?: TopicTagOmit
    problemsOnTopicTags?: ProblemsOnTopicTagsOmit
    sheetProblem?: SheetProblemOmit
    sheet?: SheetOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ProblemCountOutputType
   */

  export type ProblemCountOutputType = {
    topicTags: number
    SheetProblem: number
  }

  export type ProblemCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    topicTags?: boolean | ProblemCountOutputTypeCountTopicTagsArgs
    SheetProblem?: boolean | ProblemCountOutputTypeCountSheetProblemArgs
  }

  // Custom InputTypes
  /**
   * ProblemCountOutputType without action
   */
  export type ProblemCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemCountOutputType
     */
    select?: ProblemCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProblemCountOutputType without action
   */
  export type ProblemCountOutputTypeCountTopicTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProblemsOnTopicTagsWhereInput
  }

  /**
   * ProblemCountOutputType without action
   */
  export type ProblemCountOutputTypeCountSheetProblemArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SheetProblemWhereInput
  }


  /**
   * Count Type TopicTagCountOutputType
   */

  export type TopicTagCountOutputType = {
    problems: number
  }

  export type TopicTagCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    problems?: boolean | TopicTagCountOutputTypeCountProblemsArgs
  }

  // Custom InputTypes
  /**
   * TopicTagCountOutputType without action
   */
  export type TopicTagCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicTagCountOutputType
     */
    select?: TopicTagCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TopicTagCountOutputType without action
   */
  export type TopicTagCountOutputTypeCountProblemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProblemsOnTopicTagsWhereInput
  }


  /**
   * Count Type SheetCountOutputType
   */

  export type SheetCountOutputType = {
    SheetProblem: number
  }

  export type SheetCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    SheetProblem?: boolean | SheetCountOutputTypeCountSheetProblemArgs
  }

  // Custom InputTypes
  /**
   * SheetCountOutputType without action
   */
  export type SheetCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SheetCountOutputType
     */
    select?: SheetCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SheetCountOutputType without action
   */
  export type SheetCountOutputTypeCountSheetProblemArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SheetProblemWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Problem
   */

  export type AggregateProblem = {
    _count: ProblemCountAggregateOutputType | null
    _avg: ProblemAvgAggregateOutputType | null
    _sum: ProblemSumAggregateOutputType | null
    _min: ProblemMinAggregateOutputType | null
    _max: ProblemMaxAggregateOutputType | null
  }

  export type ProblemAvgAggregateOutputType = {
    id: number | null
    difficultyOrder: number | null
    acceptance: number | null
  }

  export type ProblemSumAggregateOutputType = {
    id: number | null
    difficultyOrder: number | null
    acceptance: number | null
  }

  export type ProblemMinAggregateOutputType = {
    id: number | null
    title: string | null
    url: string | null
    difficulty: string | null
    difficultyOrder: number | null
    acceptance: number | null
    isPaid: boolean | null
  }

  export type ProblemMaxAggregateOutputType = {
    id: number | null
    title: string | null
    url: string | null
    difficulty: string | null
    difficultyOrder: number | null
    acceptance: number | null
    isPaid: boolean | null
  }

  export type ProblemCountAggregateOutputType = {
    id: number
    title: number
    url: number
    difficulty: number
    difficultyOrder: number
    acceptance: number
    isPaid: number
    _all: number
  }


  export type ProblemAvgAggregateInputType = {
    id?: true
    difficultyOrder?: true
    acceptance?: true
  }

  export type ProblemSumAggregateInputType = {
    id?: true
    difficultyOrder?: true
    acceptance?: true
  }

  export type ProblemMinAggregateInputType = {
    id?: true
    title?: true
    url?: true
    difficulty?: true
    difficultyOrder?: true
    acceptance?: true
    isPaid?: true
  }

  export type ProblemMaxAggregateInputType = {
    id?: true
    title?: true
    url?: true
    difficulty?: true
    difficultyOrder?: true
    acceptance?: true
    isPaid?: true
  }

  export type ProblemCountAggregateInputType = {
    id?: true
    title?: true
    url?: true
    difficulty?: true
    difficultyOrder?: true
    acceptance?: true
    isPaid?: true
    _all?: true
  }

  export type ProblemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Problem to aggregate.
     */
    where?: ProblemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Problems to fetch.
     */
    orderBy?: ProblemOrderByWithRelationInput | ProblemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProblemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Problems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Problems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Problems
    **/
    _count?: true | ProblemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProblemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProblemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProblemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProblemMaxAggregateInputType
  }

  export type GetProblemAggregateType<T extends ProblemAggregateArgs> = {
        [P in keyof T & keyof AggregateProblem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProblem[P]>
      : GetScalarType<T[P], AggregateProblem[P]>
  }




  export type ProblemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProblemWhereInput
    orderBy?: ProblemOrderByWithAggregationInput | ProblemOrderByWithAggregationInput[]
    by: ProblemScalarFieldEnum[] | ProblemScalarFieldEnum
    having?: ProblemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProblemCountAggregateInputType | true
    _avg?: ProblemAvgAggregateInputType
    _sum?: ProblemSumAggregateInputType
    _min?: ProblemMinAggregateInputType
    _max?: ProblemMaxAggregateInputType
  }

  export type ProblemGroupByOutputType = {
    id: number
    title: string
    url: string
    difficulty: string
    difficultyOrder: number
    acceptance: number
    isPaid: boolean
    _count: ProblemCountAggregateOutputType | null
    _avg: ProblemAvgAggregateOutputType | null
    _sum: ProblemSumAggregateOutputType | null
    _min: ProblemMinAggregateOutputType | null
    _max: ProblemMaxAggregateOutputType | null
  }

  type GetProblemGroupByPayload<T extends ProblemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProblemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProblemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProblemGroupByOutputType[P]>
            : GetScalarType<T[P], ProblemGroupByOutputType[P]>
        }
      >
    >


  export type ProblemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    url?: boolean
    difficulty?: boolean
    difficultyOrder?: boolean
    acceptance?: boolean
    isPaid?: boolean
    topicTags?: boolean | Problem$topicTagsArgs<ExtArgs>
    SheetProblem?: boolean | Problem$SheetProblemArgs<ExtArgs>
    _count?: boolean | ProblemCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["problem"]>

  export type ProblemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    url?: boolean
    difficulty?: boolean
    difficultyOrder?: boolean
    acceptance?: boolean
    isPaid?: boolean
  }, ExtArgs["result"]["problem"]>

  export type ProblemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    url?: boolean
    difficulty?: boolean
    difficultyOrder?: boolean
    acceptance?: boolean
    isPaid?: boolean
  }, ExtArgs["result"]["problem"]>

  export type ProblemSelectScalar = {
    id?: boolean
    title?: boolean
    url?: boolean
    difficulty?: boolean
    difficultyOrder?: boolean
    acceptance?: boolean
    isPaid?: boolean
  }

  export type ProblemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "url" | "difficulty" | "difficultyOrder" | "acceptance" | "isPaid", ExtArgs["result"]["problem"]>
  export type ProblemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    topicTags?: boolean | Problem$topicTagsArgs<ExtArgs>
    SheetProblem?: boolean | Problem$SheetProblemArgs<ExtArgs>
    _count?: boolean | ProblemCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProblemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ProblemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ProblemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Problem"
    objects: {
      topicTags: Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>[]
      SheetProblem: Prisma.$SheetProblemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      title: string
      url: string
      difficulty: string
      difficultyOrder: number
      acceptance: number
      isPaid: boolean
    }, ExtArgs["result"]["problem"]>
    composites: {}
  }

  type ProblemGetPayload<S extends boolean | null | undefined | ProblemDefaultArgs> = $Result.GetResult<Prisma.$ProblemPayload, S>

  type ProblemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProblemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProblemCountAggregateInputType | true
    }

  export interface ProblemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Problem'], meta: { name: 'Problem' } }
    /**
     * Find zero or one Problem that matches the filter.
     * @param {ProblemFindUniqueArgs} args - Arguments to find a Problem
     * @example
     * // Get one Problem
     * const problem = await prisma.problem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProblemFindUniqueArgs>(args: SelectSubset<T, ProblemFindUniqueArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Problem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProblemFindUniqueOrThrowArgs} args - Arguments to find a Problem
     * @example
     * // Get one Problem
     * const problem = await prisma.problem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProblemFindUniqueOrThrowArgs>(args: SelectSubset<T, ProblemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Problem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemFindFirstArgs} args - Arguments to find a Problem
     * @example
     * // Get one Problem
     * const problem = await prisma.problem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProblemFindFirstArgs>(args?: SelectSubset<T, ProblemFindFirstArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Problem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemFindFirstOrThrowArgs} args - Arguments to find a Problem
     * @example
     * // Get one Problem
     * const problem = await prisma.problem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProblemFindFirstOrThrowArgs>(args?: SelectSubset<T, ProblemFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Problems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Problems
     * const problems = await prisma.problem.findMany()
     * 
     * // Get first 10 Problems
     * const problems = await prisma.problem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const problemWithIdOnly = await prisma.problem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProblemFindManyArgs>(args?: SelectSubset<T, ProblemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Problem.
     * @param {ProblemCreateArgs} args - Arguments to create a Problem.
     * @example
     * // Create one Problem
     * const Problem = await prisma.problem.create({
     *   data: {
     *     // ... data to create a Problem
     *   }
     * })
     * 
     */
    create<T extends ProblemCreateArgs>(args: SelectSubset<T, ProblemCreateArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Problems.
     * @param {ProblemCreateManyArgs} args - Arguments to create many Problems.
     * @example
     * // Create many Problems
     * const problem = await prisma.problem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProblemCreateManyArgs>(args?: SelectSubset<T, ProblemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Problems and returns the data saved in the database.
     * @param {ProblemCreateManyAndReturnArgs} args - Arguments to create many Problems.
     * @example
     * // Create many Problems
     * const problem = await prisma.problem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Problems and only return the `id`
     * const problemWithIdOnly = await prisma.problem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProblemCreateManyAndReturnArgs>(args?: SelectSubset<T, ProblemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Problem.
     * @param {ProblemDeleteArgs} args - Arguments to delete one Problem.
     * @example
     * // Delete one Problem
     * const Problem = await prisma.problem.delete({
     *   where: {
     *     // ... filter to delete one Problem
     *   }
     * })
     * 
     */
    delete<T extends ProblemDeleteArgs>(args: SelectSubset<T, ProblemDeleteArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Problem.
     * @param {ProblemUpdateArgs} args - Arguments to update one Problem.
     * @example
     * // Update one Problem
     * const problem = await prisma.problem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProblemUpdateArgs>(args: SelectSubset<T, ProblemUpdateArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Problems.
     * @param {ProblemDeleteManyArgs} args - Arguments to filter Problems to delete.
     * @example
     * // Delete a few Problems
     * const { count } = await prisma.problem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProblemDeleteManyArgs>(args?: SelectSubset<T, ProblemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Problems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Problems
     * const problem = await prisma.problem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProblemUpdateManyArgs>(args: SelectSubset<T, ProblemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Problems and returns the data updated in the database.
     * @param {ProblemUpdateManyAndReturnArgs} args - Arguments to update many Problems.
     * @example
     * // Update many Problems
     * const problem = await prisma.problem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Problems and only return the `id`
     * const problemWithIdOnly = await prisma.problem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProblemUpdateManyAndReturnArgs>(args: SelectSubset<T, ProblemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Problem.
     * @param {ProblemUpsertArgs} args - Arguments to update or create a Problem.
     * @example
     * // Update or create a Problem
     * const problem = await prisma.problem.upsert({
     *   create: {
     *     // ... data to create a Problem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Problem we want to update
     *   }
     * })
     */
    upsert<T extends ProblemUpsertArgs>(args: SelectSubset<T, ProblemUpsertArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Problems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemCountArgs} args - Arguments to filter Problems to count.
     * @example
     * // Count the number of Problems
     * const count = await prisma.problem.count({
     *   where: {
     *     // ... the filter for the Problems we want to count
     *   }
     * })
    **/
    count<T extends ProblemCountArgs>(
      args?: Subset<T, ProblemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProblemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Problem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProblemAggregateArgs>(args: Subset<T, ProblemAggregateArgs>): Prisma.PrismaPromise<GetProblemAggregateType<T>>

    /**
     * Group by Problem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProblemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProblemGroupByArgs['orderBy'] }
        : { orderBy?: ProblemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProblemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProblemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Problem model
   */
  readonly fields: ProblemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Problem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProblemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    topicTags<T extends Problem$topicTagsArgs<ExtArgs> = {}>(args?: Subset<T, Problem$topicTagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    SheetProblem<T extends Problem$SheetProblemArgs<ExtArgs> = {}>(args?: Subset<T, Problem$SheetProblemArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SheetProblemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Problem model
   */
  interface ProblemFieldRefs {
    readonly id: FieldRef<"Problem", 'Int'>
    readonly title: FieldRef<"Problem", 'String'>
    readonly url: FieldRef<"Problem", 'String'>
    readonly difficulty: FieldRef<"Problem", 'String'>
    readonly difficultyOrder: FieldRef<"Problem", 'Int'>
    readonly acceptance: FieldRef<"Problem", 'Int'>
    readonly isPaid: FieldRef<"Problem", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Problem findUnique
   */
  export type ProblemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * Filter, which Problem to fetch.
     */
    where: ProblemWhereUniqueInput
  }

  /**
   * Problem findUniqueOrThrow
   */
  export type ProblemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * Filter, which Problem to fetch.
     */
    where: ProblemWhereUniqueInput
  }

  /**
   * Problem findFirst
   */
  export type ProblemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * Filter, which Problem to fetch.
     */
    where?: ProblemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Problems to fetch.
     */
    orderBy?: ProblemOrderByWithRelationInput | ProblemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Problems.
     */
    cursor?: ProblemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Problems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Problems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Problems.
     */
    distinct?: ProblemScalarFieldEnum | ProblemScalarFieldEnum[]
  }

  /**
   * Problem findFirstOrThrow
   */
  export type ProblemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * Filter, which Problem to fetch.
     */
    where?: ProblemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Problems to fetch.
     */
    orderBy?: ProblemOrderByWithRelationInput | ProblemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Problems.
     */
    cursor?: ProblemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Problems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Problems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Problems.
     */
    distinct?: ProblemScalarFieldEnum | ProblemScalarFieldEnum[]
  }

  /**
   * Problem findMany
   */
  export type ProblemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * Filter, which Problems to fetch.
     */
    where?: ProblemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Problems to fetch.
     */
    orderBy?: ProblemOrderByWithRelationInput | ProblemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Problems.
     */
    cursor?: ProblemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Problems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Problems.
     */
    skip?: number
    distinct?: ProblemScalarFieldEnum | ProblemScalarFieldEnum[]
  }

  /**
   * Problem create
   */
  export type ProblemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * The data needed to create a Problem.
     */
    data: XOR<ProblemCreateInput, ProblemUncheckedCreateInput>
  }

  /**
   * Problem createMany
   */
  export type ProblemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Problems.
     */
    data: ProblemCreateManyInput | ProblemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Problem createManyAndReturn
   */
  export type ProblemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * The data used to create many Problems.
     */
    data: ProblemCreateManyInput | ProblemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Problem update
   */
  export type ProblemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * The data needed to update a Problem.
     */
    data: XOR<ProblemUpdateInput, ProblemUncheckedUpdateInput>
    /**
     * Choose, which Problem to update.
     */
    where: ProblemWhereUniqueInput
  }

  /**
   * Problem updateMany
   */
  export type ProblemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Problems.
     */
    data: XOR<ProblemUpdateManyMutationInput, ProblemUncheckedUpdateManyInput>
    /**
     * Filter which Problems to update
     */
    where?: ProblemWhereInput
    /**
     * Limit how many Problems to update.
     */
    limit?: number
  }

  /**
   * Problem updateManyAndReturn
   */
  export type ProblemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * The data used to update Problems.
     */
    data: XOR<ProblemUpdateManyMutationInput, ProblemUncheckedUpdateManyInput>
    /**
     * Filter which Problems to update
     */
    where?: ProblemWhereInput
    /**
     * Limit how many Problems to update.
     */
    limit?: number
  }

  /**
   * Problem upsert
   */
  export type ProblemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * The filter to search for the Problem to update in case it exists.
     */
    where: ProblemWhereUniqueInput
    /**
     * In case the Problem found by the `where` argument doesn't exist, create a new Problem with this data.
     */
    create: XOR<ProblemCreateInput, ProblemUncheckedCreateInput>
    /**
     * In case the Problem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProblemUpdateInput, ProblemUncheckedUpdateInput>
  }

  /**
   * Problem delete
   */
  export type ProblemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * Filter which Problem to delete.
     */
    where: ProblemWhereUniqueInput
  }

  /**
   * Problem deleteMany
   */
  export type ProblemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Problems to delete
     */
    where?: ProblemWhereInput
    /**
     * Limit how many Problems to delete.
     */
    limit?: number
  }

  /**
   * Problem.topicTags
   */
  export type Problem$topicTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemsOnTopicTags
     */
    select?: ProblemsOnTopicTagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProblemsOnTopicTags
     */
    omit?: ProblemsOnTopicTagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemsOnTopicTagsInclude<ExtArgs> | null
    where?: ProblemsOnTopicTagsWhereInput
    orderBy?: ProblemsOnTopicTagsOrderByWithRelationInput | ProblemsOnTopicTagsOrderByWithRelationInput[]
    cursor?: ProblemsOnTopicTagsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProblemsOnTopicTagsScalarFieldEnum | ProblemsOnTopicTagsScalarFieldEnum[]
  }

  /**
   * Problem.SheetProblem
   */
  export type Problem$SheetProblemArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SheetProblem
     */
    select?: SheetProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SheetProblem
     */
    omit?: SheetProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetProblemInclude<ExtArgs> | null
    where?: SheetProblemWhereInput
    orderBy?: SheetProblemOrderByWithRelationInput | SheetProblemOrderByWithRelationInput[]
    cursor?: SheetProblemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SheetProblemScalarFieldEnum | SheetProblemScalarFieldEnum[]
  }

  /**
   * Problem without action
   */
  export type ProblemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
  }


  /**
   * Model TopicTag
   */

  export type AggregateTopicTag = {
    _count: TopicTagCountAggregateOutputType | null
    _avg: TopicTagAvgAggregateOutputType | null
    _sum: TopicTagSumAggregateOutputType | null
    _min: TopicTagMinAggregateOutputType | null
    _max: TopicTagMaxAggregateOutputType | null
  }

  export type TopicTagAvgAggregateOutputType = {
    id: number | null
  }

  export type TopicTagSumAggregateOutputType = {
    id: number | null
  }

  export type TopicTagMinAggregateOutputType = {
    id: number | null
    slug: string | null
    name: string | null
  }

  export type TopicTagMaxAggregateOutputType = {
    id: number | null
    slug: string | null
    name: string | null
  }

  export type TopicTagCountAggregateOutputType = {
    id: number
    slug: number
    name: number
    _all: number
  }


  export type TopicTagAvgAggregateInputType = {
    id?: true
  }

  export type TopicTagSumAggregateInputType = {
    id?: true
  }

  export type TopicTagMinAggregateInputType = {
    id?: true
    slug?: true
    name?: true
  }

  export type TopicTagMaxAggregateInputType = {
    id?: true
    slug?: true
    name?: true
  }

  export type TopicTagCountAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    _all?: true
  }

  export type TopicTagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TopicTag to aggregate.
     */
    where?: TopicTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TopicTags to fetch.
     */
    orderBy?: TopicTagOrderByWithRelationInput | TopicTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TopicTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TopicTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TopicTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TopicTags
    **/
    _count?: true | TopicTagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TopicTagAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TopicTagSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TopicTagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TopicTagMaxAggregateInputType
  }

  export type GetTopicTagAggregateType<T extends TopicTagAggregateArgs> = {
        [P in keyof T & keyof AggregateTopicTag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTopicTag[P]>
      : GetScalarType<T[P], AggregateTopicTag[P]>
  }




  export type TopicTagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TopicTagWhereInput
    orderBy?: TopicTagOrderByWithAggregationInput | TopicTagOrderByWithAggregationInput[]
    by: TopicTagScalarFieldEnum[] | TopicTagScalarFieldEnum
    having?: TopicTagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TopicTagCountAggregateInputType | true
    _avg?: TopicTagAvgAggregateInputType
    _sum?: TopicTagSumAggregateInputType
    _min?: TopicTagMinAggregateInputType
    _max?: TopicTagMaxAggregateInputType
  }

  export type TopicTagGroupByOutputType = {
    id: number
    slug: string
    name: string
    _count: TopicTagCountAggregateOutputType | null
    _avg: TopicTagAvgAggregateOutputType | null
    _sum: TopicTagSumAggregateOutputType | null
    _min: TopicTagMinAggregateOutputType | null
    _max: TopicTagMaxAggregateOutputType | null
  }

  type GetTopicTagGroupByPayload<T extends TopicTagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TopicTagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TopicTagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TopicTagGroupByOutputType[P]>
            : GetScalarType<T[P], TopicTagGroupByOutputType[P]>
        }
      >
    >


  export type TopicTagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    problems?: boolean | TopicTag$problemsArgs<ExtArgs>
    _count?: boolean | TopicTagCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["topicTag"]>

  export type TopicTagSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
  }, ExtArgs["result"]["topicTag"]>

  export type TopicTagSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
  }, ExtArgs["result"]["topicTag"]>

  export type TopicTagSelectScalar = {
    id?: boolean
    slug?: boolean
    name?: boolean
  }

  export type TopicTagOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "slug" | "name", ExtArgs["result"]["topicTag"]>
  export type TopicTagInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    problems?: boolean | TopicTag$problemsArgs<ExtArgs>
    _count?: boolean | TopicTagCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TopicTagIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TopicTagIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TopicTagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TopicTag"
    objects: {
      problems: Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      slug: string
      name: string
    }, ExtArgs["result"]["topicTag"]>
    composites: {}
  }

  type TopicTagGetPayload<S extends boolean | null | undefined | TopicTagDefaultArgs> = $Result.GetResult<Prisma.$TopicTagPayload, S>

  type TopicTagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TopicTagFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TopicTagCountAggregateInputType | true
    }

  export interface TopicTagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TopicTag'], meta: { name: 'TopicTag' } }
    /**
     * Find zero or one TopicTag that matches the filter.
     * @param {TopicTagFindUniqueArgs} args - Arguments to find a TopicTag
     * @example
     * // Get one TopicTag
     * const topicTag = await prisma.topicTag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TopicTagFindUniqueArgs>(args: SelectSubset<T, TopicTagFindUniqueArgs<ExtArgs>>): Prisma__TopicTagClient<$Result.GetResult<Prisma.$TopicTagPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TopicTag that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TopicTagFindUniqueOrThrowArgs} args - Arguments to find a TopicTag
     * @example
     * // Get one TopicTag
     * const topicTag = await prisma.topicTag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TopicTagFindUniqueOrThrowArgs>(args: SelectSubset<T, TopicTagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TopicTagClient<$Result.GetResult<Prisma.$TopicTagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TopicTag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicTagFindFirstArgs} args - Arguments to find a TopicTag
     * @example
     * // Get one TopicTag
     * const topicTag = await prisma.topicTag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TopicTagFindFirstArgs>(args?: SelectSubset<T, TopicTagFindFirstArgs<ExtArgs>>): Prisma__TopicTagClient<$Result.GetResult<Prisma.$TopicTagPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TopicTag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicTagFindFirstOrThrowArgs} args - Arguments to find a TopicTag
     * @example
     * // Get one TopicTag
     * const topicTag = await prisma.topicTag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TopicTagFindFirstOrThrowArgs>(args?: SelectSubset<T, TopicTagFindFirstOrThrowArgs<ExtArgs>>): Prisma__TopicTagClient<$Result.GetResult<Prisma.$TopicTagPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TopicTags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicTagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TopicTags
     * const topicTags = await prisma.topicTag.findMany()
     * 
     * // Get first 10 TopicTags
     * const topicTags = await prisma.topicTag.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const topicTagWithIdOnly = await prisma.topicTag.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TopicTagFindManyArgs>(args?: SelectSubset<T, TopicTagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TopicTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TopicTag.
     * @param {TopicTagCreateArgs} args - Arguments to create a TopicTag.
     * @example
     * // Create one TopicTag
     * const TopicTag = await prisma.topicTag.create({
     *   data: {
     *     // ... data to create a TopicTag
     *   }
     * })
     * 
     */
    create<T extends TopicTagCreateArgs>(args: SelectSubset<T, TopicTagCreateArgs<ExtArgs>>): Prisma__TopicTagClient<$Result.GetResult<Prisma.$TopicTagPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TopicTags.
     * @param {TopicTagCreateManyArgs} args - Arguments to create many TopicTags.
     * @example
     * // Create many TopicTags
     * const topicTag = await prisma.topicTag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TopicTagCreateManyArgs>(args?: SelectSubset<T, TopicTagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TopicTags and returns the data saved in the database.
     * @param {TopicTagCreateManyAndReturnArgs} args - Arguments to create many TopicTags.
     * @example
     * // Create many TopicTags
     * const topicTag = await prisma.topicTag.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TopicTags and only return the `id`
     * const topicTagWithIdOnly = await prisma.topicTag.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TopicTagCreateManyAndReturnArgs>(args?: SelectSubset<T, TopicTagCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TopicTagPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TopicTag.
     * @param {TopicTagDeleteArgs} args - Arguments to delete one TopicTag.
     * @example
     * // Delete one TopicTag
     * const TopicTag = await prisma.topicTag.delete({
     *   where: {
     *     // ... filter to delete one TopicTag
     *   }
     * })
     * 
     */
    delete<T extends TopicTagDeleteArgs>(args: SelectSubset<T, TopicTagDeleteArgs<ExtArgs>>): Prisma__TopicTagClient<$Result.GetResult<Prisma.$TopicTagPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TopicTag.
     * @param {TopicTagUpdateArgs} args - Arguments to update one TopicTag.
     * @example
     * // Update one TopicTag
     * const topicTag = await prisma.topicTag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TopicTagUpdateArgs>(args: SelectSubset<T, TopicTagUpdateArgs<ExtArgs>>): Prisma__TopicTagClient<$Result.GetResult<Prisma.$TopicTagPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TopicTags.
     * @param {TopicTagDeleteManyArgs} args - Arguments to filter TopicTags to delete.
     * @example
     * // Delete a few TopicTags
     * const { count } = await prisma.topicTag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TopicTagDeleteManyArgs>(args?: SelectSubset<T, TopicTagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TopicTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicTagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TopicTags
     * const topicTag = await prisma.topicTag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TopicTagUpdateManyArgs>(args: SelectSubset<T, TopicTagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TopicTags and returns the data updated in the database.
     * @param {TopicTagUpdateManyAndReturnArgs} args - Arguments to update many TopicTags.
     * @example
     * // Update many TopicTags
     * const topicTag = await prisma.topicTag.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TopicTags and only return the `id`
     * const topicTagWithIdOnly = await prisma.topicTag.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TopicTagUpdateManyAndReturnArgs>(args: SelectSubset<T, TopicTagUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TopicTagPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TopicTag.
     * @param {TopicTagUpsertArgs} args - Arguments to update or create a TopicTag.
     * @example
     * // Update or create a TopicTag
     * const topicTag = await prisma.topicTag.upsert({
     *   create: {
     *     // ... data to create a TopicTag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TopicTag we want to update
     *   }
     * })
     */
    upsert<T extends TopicTagUpsertArgs>(args: SelectSubset<T, TopicTagUpsertArgs<ExtArgs>>): Prisma__TopicTagClient<$Result.GetResult<Prisma.$TopicTagPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TopicTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicTagCountArgs} args - Arguments to filter TopicTags to count.
     * @example
     * // Count the number of TopicTags
     * const count = await prisma.topicTag.count({
     *   where: {
     *     // ... the filter for the TopicTags we want to count
     *   }
     * })
    **/
    count<T extends TopicTagCountArgs>(
      args?: Subset<T, TopicTagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TopicTagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TopicTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicTagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TopicTagAggregateArgs>(args: Subset<T, TopicTagAggregateArgs>): Prisma.PrismaPromise<GetTopicTagAggregateType<T>>

    /**
     * Group by TopicTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicTagGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TopicTagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TopicTagGroupByArgs['orderBy'] }
        : { orderBy?: TopicTagGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TopicTagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTopicTagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TopicTag model
   */
  readonly fields: TopicTagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TopicTag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TopicTagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    problems<T extends TopicTag$problemsArgs<ExtArgs> = {}>(args?: Subset<T, TopicTag$problemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TopicTag model
   */
  interface TopicTagFieldRefs {
    readonly id: FieldRef<"TopicTag", 'Int'>
    readonly slug: FieldRef<"TopicTag", 'String'>
    readonly name: FieldRef<"TopicTag", 'String'>
  }
    

  // Custom InputTypes
  /**
   * TopicTag findUnique
   */
  export type TopicTagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicTag
     */
    select?: TopicTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicTag
     */
    omit?: TopicTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicTagInclude<ExtArgs> | null
    /**
     * Filter, which TopicTag to fetch.
     */
    where: TopicTagWhereUniqueInput
  }

  /**
   * TopicTag findUniqueOrThrow
   */
  export type TopicTagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicTag
     */
    select?: TopicTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicTag
     */
    omit?: TopicTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicTagInclude<ExtArgs> | null
    /**
     * Filter, which TopicTag to fetch.
     */
    where: TopicTagWhereUniqueInput
  }

  /**
   * TopicTag findFirst
   */
  export type TopicTagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicTag
     */
    select?: TopicTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicTag
     */
    omit?: TopicTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicTagInclude<ExtArgs> | null
    /**
     * Filter, which TopicTag to fetch.
     */
    where?: TopicTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TopicTags to fetch.
     */
    orderBy?: TopicTagOrderByWithRelationInput | TopicTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TopicTags.
     */
    cursor?: TopicTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TopicTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TopicTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TopicTags.
     */
    distinct?: TopicTagScalarFieldEnum | TopicTagScalarFieldEnum[]
  }

  /**
   * TopicTag findFirstOrThrow
   */
  export type TopicTagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicTag
     */
    select?: TopicTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicTag
     */
    omit?: TopicTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicTagInclude<ExtArgs> | null
    /**
     * Filter, which TopicTag to fetch.
     */
    where?: TopicTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TopicTags to fetch.
     */
    orderBy?: TopicTagOrderByWithRelationInput | TopicTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TopicTags.
     */
    cursor?: TopicTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TopicTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TopicTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TopicTags.
     */
    distinct?: TopicTagScalarFieldEnum | TopicTagScalarFieldEnum[]
  }

  /**
   * TopicTag findMany
   */
  export type TopicTagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicTag
     */
    select?: TopicTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicTag
     */
    omit?: TopicTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicTagInclude<ExtArgs> | null
    /**
     * Filter, which TopicTags to fetch.
     */
    where?: TopicTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TopicTags to fetch.
     */
    orderBy?: TopicTagOrderByWithRelationInput | TopicTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TopicTags.
     */
    cursor?: TopicTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TopicTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TopicTags.
     */
    skip?: number
    distinct?: TopicTagScalarFieldEnum | TopicTagScalarFieldEnum[]
  }

  /**
   * TopicTag create
   */
  export type TopicTagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicTag
     */
    select?: TopicTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicTag
     */
    omit?: TopicTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicTagInclude<ExtArgs> | null
    /**
     * The data needed to create a TopicTag.
     */
    data: XOR<TopicTagCreateInput, TopicTagUncheckedCreateInput>
  }

  /**
   * TopicTag createMany
   */
  export type TopicTagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TopicTags.
     */
    data: TopicTagCreateManyInput | TopicTagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TopicTag createManyAndReturn
   */
  export type TopicTagCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicTag
     */
    select?: TopicTagSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TopicTag
     */
    omit?: TopicTagOmit<ExtArgs> | null
    /**
     * The data used to create many TopicTags.
     */
    data: TopicTagCreateManyInput | TopicTagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TopicTag update
   */
  export type TopicTagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicTag
     */
    select?: TopicTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicTag
     */
    omit?: TopicTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicTagInclude<ExtArgs> | null
    /**
     * The data needed to update a TopicTag.
     */
    data: XOR<TopicTagUpdateInput, TopicTagUncheckedUpdateInput>
    /**
     * Choose, which TopicTag to update.
     */
    where: TopicTagWhereUniqueInput
  }

  /**
   * TopicTag updateMany
   */
  export type TopicTagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TopicTags.
     */
    data: XOR<TopicTagUpdateManyMutationInput, TopicTagUncheckedUpdateManyInput>
    /**
     * Filter which TopicTags to update
     */
    where?: TopicTagWhereInput
    /**
     * Limit how many TopicTags to update.
     */
    limit?: number
  }

  /**
   * TopicTag updateManyAndReturn
   */
  export type TopicTagUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicTag
     */
    select?: TopicTagSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TopicTag
     */
    omit?: TopicTagOmit<ExtArgs> | null
    /**
     * The data used to update TopicTags.
     */
    data: XOR<TopicTagUpdateManyMutationInput, TopicTagUncheckedUpdateManyInput>
    /**
     * Filter which TopicTags to update
     */
    where?: TopicTagWhereInput
    /**
     * Limit how many TopicTags to update.
     */
    limit?: number
  }

  /**
   * TopicTag upsert
   */
  export type TopicTagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicTag
     */
    select?: TopicTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicTag
     */
    omit?: TopicTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicTagInclude<ExtArgs> | null
    /**
     * The filter to search for the TopicTag to update in case it exists.
     */
    where: TopicTagWhereUniqueInput
    /**
     * In case the TopicTag found by the `where` argument doesn't exist, create a new TopicTag with this data.
     */
    create: XOR<TopicTagCreateInput, TopicTagUncheckedCreateInput>
    /**
     * In case the TopicTag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TopicTagUpdateInput, TopicTagUncheckedUpdateInput>
  }

  /**
   * TopicTag delete
   */
  export type TopicTagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicTag
     */
    select?: TopicTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicTag
     */
    omit?: TopicTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicTagInclude<ExtArgs> | null
    /**
     * Filter which TopicTag to delete.
     */
    where: TopicTagWhereUniqueInput
  }

  /**
   * TopicTag deleteMany
   */
  export type TopicTagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TopicTags to delete
     */
    where?: TopicTagWhereInput
    /**
     * Limit how many TopicTags to delete.
     */
    limit?: number
  }

  /**
   * TopicTag.problems
   */
  export type TopicTag$problemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemsOnTopicTags
     */
    select?: ProblemsOnTopicTagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProblemsOnTopicTags
     */
    omit?: ProblemsOnTopicTagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemsOnTopicTagsInclude<ExtArgs> | null
    where?: ProblemsOnTopicTagsWhereInput
    orderBy?: ProblemsOnTopicTagsOrderByWithRelationInput | ProblemsOnTopicTagsOrderByWithRelationInput[]
    cursor?: ProblemsOnTopicTagsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProblemsOnTopicTagsScalarFieldEnum | ProblemsOnTopicTagsScalarFieldEnum[]
  }

  /**
   * TopicTag without action
   */
  export type TopicTagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicTag
     */
    select?: TopicTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicTag
     */
    omit?: TopicTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicTagInclude<ExtArgs> | null
  }


  /**
   * Model ProblemsOnTopicTags
   */

  export type AggregateProblemsOnTopicTags = {
    _count: ProblemsOnTopicTagsCountAggregateOutputType | null
    _avg: ProblemsOnTopicTagsAvgAggregateOutputType | null
    _sum: ProblemsOnTopicTagsSumAggregateOutputType | null
    _min: ProblemsOnTopicTagsMinAggregateOutputType | null
    _max: ProblemsOnTopicTagsMaxAggregateOutputType | null
  }

  export type ProblemsOnTopicTagsAvgAggregateOutputType = {
    problemId: number | null
    topicTagId: number | null
  }

  export type ProblemsOnTopicTagsSumAggregateOutputType = {
    problemId: number | null
    topicTagId: number | null
  }

  export type ProblemsOnTopicTagsMinAggregateOutputType = {
    problemId: number | null
    topicTagId: number | null
  }

  export type ProblemsOnTopicTagsMaxAggregateOutputType = {
    problemId: number | null
    topicTagId: number | null
  }

  export type ProblemsOnTopicTagsCountAggregateOutputType = {
    problemId: number
    topicTagId: number
    _all: number
  }


  export type ProblemsOnTopicTagsAvgAggregateInputType = {
    problemId?: true
    topicTagId?: true
  }

  export type ProblemsOnTopicTagsSumAggregateInputType = {
    problemId?: true
    topicTagId?: true
  }

  export type ProblemsOnTopicTagsMinAggregateInputType = {
    problemId?: true
    topicTagId?: true
  }

  export type ProblemsOnTopicTagsMaxAggregateInputType = {
    problemId?: true
    topicTagId?: true
  }

  export type ProblemsOnTopicTagsCountAggregateInputType = {
    problemId?: true
    topicTagId?: true
    _all?: true
  }

  export type ProblemsOnTopicTagsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProblemsOnTopicTags to aggregate.
     */
    where?: ProblemsOnTopicTagsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProblemsOnTopicTags to fetch.
     */
    orderBy?: ProblemsOnTopicTagsOrderByWithRelationInput | ProblemsOnTopicTagsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProblemsOnTopicTagsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProblemsOnTopicTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProblemsOnTopicTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProblemsOnTopicTags
    **/
    _count?: true | ProblemsOnTopicTagsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProblemsOnTopicTagsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProblemsOnTopicTagsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProblemsOnTopicTagsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProblemsOnTopicTagsMaxAggregateInputType
  }

  export type GetProblemsOnTopicTagsAggregateType<T extends ProblemsOnTopicTagsAggregateArgs> = {
        [P in keyof T & keyof AggregateProblemsOnTopicTags]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProblemsOnTopicTags[P]>
      : GetScalarType<T[P], AggregateProblemsOnTopicTags[P]>
  }




  export type ProblemsOnTopicTagsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProblemsOnTopicTagsWhereInput
    orderBy?: ProblemsOnTopicTagsOrderByWithAggregationInput | ProblemsOnTopicTagsOrderByWithAggregationInput[]
    by: ProblemsOnTopicTagsScalarFieldEnum[] | ProblemsOnTopicTagsScalarFieldEnum
    having?: ProblemsOnTopicTagsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProblemsOnTopicTagsCountAggregateInputType | true
    _avg?: ProblemsOnTopicTagsAvgAggregateInputType
    _sum?: ProblemsOnTopicTagsSumAggregateInputType
    _min?: ProblemsOnTopicTagsMinAggregateInputType
    _max?: ProblemsOnTopicTagsMaxAggregateInputType
  }

  export type ProblemsOnTopicTagsGroupByOutputType = {
    problemId: number
    topicTagId: number
    _count: ProblemsOnTopicTagsCountAggregateOutputType | null
    _avg: ProblemsOnTopicTagsAvgAggregateOutputType | null
    _sum: ProblemsOnTopicTagsSumAggregateOutputType | null
    _min: ProblemsOnTopicTagsMinAggregateOutputType | null
    _max: ProblemsOnTopicTagsMaxAggregateOutputType | null
  }

  type GetProblemsOnTopicTagsGroupByPayload<T extends ProblemsOnTopicTagsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProblemsOnTopicTagsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProblemsOnTopicTagsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProblemsOnTopicTagsGroupByOutputType[P]>
            : GetScalarType<T[P], ProblemsOnTopicTagsGroupByOutputType[P]>
        }
      >
    >


  export type ProblemsOnTopicTagsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    problemId?: boolean
    topicTagId?: boolean
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
    topicTag?: boolean | TopicTagDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["problemsOnTopicTags"]>

  export type ProblemsOnTopicTagsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    problemId?: boolean
    topicTagId?: boolean
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
    topicTag?: boolean | TopicTagDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["problemsOnTopicTags"]>

  export type ProblemsOnTopicTagsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    problemId?: boolean
    topicTagId?: boolean
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
    topicTag?: boolean | TopicTagDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["problemsOnTopicTags"]>

  export type ProblemsOnTopicTagsSelectScalar = {
    problemId?: boolean
    topicTagId?: boolean
  }

  export type ProblemsOnTopicTagsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"problemId" | "topicTagId", ExtArgs["result"]["problemsOnTopicTags"]>
  export type ProblemsOnTopicTagsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
    topicTag?: boolean | TopicTagDefaultArgs<ExtArgs>
  }
  export type ProblemsOnTopicTagsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
    topicTag?: boolean | TopicTagDefaultArgs<ExtArgs>
  }
  export type ProblemsOnTopicTagsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
    topicTag?: boolean | TopicTagDefaultArgs<ExtArgs>
  }

  export type $ProblemsOnTopicTagsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProblemsOnTopicTags"
    objects: {
      problem: Prisma.$ProblemPayload<ExtArgs>
      topicTag: Prisma.$TopicTagPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      problemId: number
      topicTagId: number
    }, ExtArgs["result"]["problemsOnTopicTags"]>
    composites: {}
  }

  type ProblemsOnTopicTagsGetPayload<S extends boolean | null | undefined | ProblemsOnTopicTagsDefaultArgs> = $Result.GetResult<Prisma.$ProblemsOnTopicTagsPayload, S>

  type ProblemsOnTopicTagsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProblemsOnTopicTagsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProblemsOnTopicTagsCountAggregateInputType | true
    }

  export interface ProblemsOnTopicTagsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProblemsOnTopicTags'], meta: { name: 'ProblemsOnTopicTags' } }
    /**
     * Find zero or one ProblemsOnTopicTags that matches the filter.
     * @param {ProblemsOnTopicTagsFindUniqueArgs} args - Arguments to find a ProblemsOnTopicTags
     * @example
     * // Get one ProblemsOnTopicTags
     * const problemsOnTopicTags = await prisma.problemsOnTopicTags.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProblemsOnTopicTagsFindUniqueArgs>(args: SelectSubset<T, ProblemsOnTopicTagsFindUniqueArgs<ExtArgs>>): Prisma__ProblemsOnTopicTagsClient<$Result.GetResult<Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ProblemsOnTopicTags that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProblemsOnTopicTagsFindUniqueOrThrowArgs} args - Arguments to find a ProblemsOnTopicTags
     * @example
     * // Get one ProblemsOnTopicTags
     * const problemsOnTopicTags = await prisma.problemsOnTopicTags.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProblemsOnTopicTagsFindUniqueOrThrowArgs>(args: SelectSubset<T, ProblemsOnTopicTagsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProblemsOnTopicTagsClient<$Result.GetResult<Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ProblemsOnTopicTags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemsOnTopicTagsFindFirstArgs} args - Arguments to find a ProblemsOnTopicTags
     * @example
     * // Get one ProblemsOnTopicTags
     * const problemsOnTopicTags = await prisma.problemsOnTopicTags.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProblemsOnTopicTagsFindFirstArgs>(args?: SelectSubset<T, ProblemsOnTopicTagsFindFirstArgs<ExtArgs>>): Prisma__ProblemsOnTopicTagsClient<$Result.GetResult<Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ProblemsOnTopicTags that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemsOnTopicTagsFindFirstOrThrowArgs} args - Arguments to find a ProblemsOnTopicTags
     * @example
     * // Get one ProblemsOnTopicTags
     * const problemsOnTopicTags = await prisma.problemsOnTopicTags.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProblemsOnTopicTagsFindFirstOrThrowArgs>(args?: SelectSubset<T, ProblemsOnTopicTagsFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProblemsOnTopicTagsClient<$Result.GetResult<Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ProblemsOnTopicTags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemsOnTopicTagsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProblemsOnTopicTags
     * const problemsOnTopicTags = await prisma.problemsOnTopicTags.findMany()
     * 
     * // Get first 10 ProblemsOnTopicTags
     * const problemsOnTopicTags = await prisma.problemsOnTopicTags.findMany({ take: 10 })
     * 
     * // Only select the `problemId`
     * const problemsOnTopicTagsWithProblemIdOnly = await prisma.problemsOnTopicTags.findMany({ select: { problemId: true } })
     * 
     */
    findMany<T extends ProblemsOnTopicTagsFindManyArgs>(args?: SelectSubset<T, ProblemsOnTopicTagsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ProblemsOnTopicTags.
     * @param {ProblemsOnTopicTagsCreateArgs} args - Arguments to create a ProblemsOnTopicTags.
     * @example
     * // Create one ProblemsOnTopicTags
     * const ProblemsOnTopicTags = await prisma.problemsOnTopicTags.create({
     *   data: {
     *     // ... data to create a ProblemsOnTopicTags
     *   }
     * })
     * 
     */
    create<T extends ProblemsOnTopicTagsCreateArgs>(args: SelectSubset<T, ProblemsOnTopicTagsCreateArgs<ExtArgs>>): Prisma__ProblemsOnTopicTagsClient<$Result.GetResult<Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ProblemsOnTopicTags.
     * @param {ProblemsOnTopicTagsCreateManyArgs} args - Arguments to create many ProblemsOnTopicTags.
     * @example
     * // Create many ProblemsOnTopicTags
     * const problemsOnTopicTags = await prisma.problemsOnTopicTags.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProblemsOnTopicTagsCreateManyArgs>(args?: SelectSubset<T, ProblemsOnTopicTagsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProblemsOnTopicTags and returns the data saved in the database.
     * @param {ProblemsOnTopicTagsCreateManyAndReturnArgs} args - Arguments to create many ProblemsOnTopicTags.
     * @example
     * // Create many ProblemsOnTopicTags
     * const problemsOnTopicTags = await prisma.problemsOnTopicTags.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProblemsOnTopicTags and only return the `problemId`
     * const problemsOnTopicTagsWithProblemIdOnly = await prisma.problemsOnTopicTags.createManyAndReturn({
     *   select: { problemId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProblemsOnTopicTagsCreateManyAndReturnArgs>(args?: SelectSubset<T, ProblemsOnTopicTagsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ProblemsOnTopicTags.
     * @param {ProblemsOnTopicTagsDeleteArgs} args - Arguments to delete one ProblemsOnTopicTags.
     * @example
     * // Delete one ProblemsOnTopicTags
     * const ProblemsOnTopicTags = await prisma.problemsOnTopicTags.delete({
     *   where: {
     *     // ... filter to delete one ProblemsOnTopicTags
     *   }
     * })
     * 
     */
    delete<T extends ProblemsOnTopicTagsDeleteArgs>(args: SelectSubset<T, ProblemsOnTopicTagsDeleteArgs<ExtArgs>>): Prisma__ProblemsOnTopicTagsClient<$Result.GetResult<Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ProblemsOnTopicTags.
     * @param {ProblemsOnTopicTagsUpdateArgs} args - Arguments to update one ProblemsOnTopicTags.
     * @example
     * // Update one ProblemsOnTopicTags
     * const problemsOnTopicTags = await prisma.problemsOnTopicTags.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProblemsOnTopicTagsUpdateArgs>(args: SelectSubset<T, ProblemsOnTopicTagsUpdateArgs<ExtArgs>>): Prisma__ProblemsOnTopicTagsClient<$Result.GetResult<Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ProblemsOnTopicTags.
     * @param {ProblemsOnTopicTagsDeleteManyArgs} args - Arguments to filter ProblemsOnTopicTags to delete.
     * @example
     * // Delete a few ProblemsOnTopicTags
     * const { count } = await prisma.problemsOnTopicTags.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProblemsOnTopicTagsDeleteManyArgs>(args?: SelectSubset<T, ProblemsOnTopicTagsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProblemsOnTopicTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemsOnTopicTagsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProblemsOnTopicTags
     * const problemsOnTopicTags = await prisma.problemsOnTopicTags.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProblemsOnTopicTagsUpdateManyArgs>(args: SelectSubset<T, ProblemsOnTopicTagsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProblemsOnTopicTags and returns the data updated in the database.
     * @param {ProblemsOnTopicTagsUpdateManyAndReturnArgs} args - Arguments to update many ProblemsOnTopicTags.
     * @example
     * // Update many ProblemsOnTopicTags
     * const problemsOnTopicTags = await prisma.problemsOnTopicTags.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ProblemsOnTopicTags and only return the `problemId`
     * const problemsOnTopicTagsWithProblemIdOnly = await prisma.problemsOnTopicTags.updateManyAndReturn({
     *   select: { problemId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProblemsOnTopicTagsUpdateManyAndReturnArgs>(args: SelectSubset<T, ProblemsOnTopicTagsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ProblemsOnTopicTags.
     * @param {ProblemsOnTopicTagsUpsertArgs} args - Arguments to update or create a ProblemsOnTopicTags.
     * @example
     * // Update or create a ProblemsOnTopicTags
     * const problemsOnTopicTags = await prisma.problemsOnTopicTags.upsert({
     *   create: {
     *     // ... data to create a ProblemsOnTopicTags
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProblemsOnTopicTags we want to update
     *   }
     * })
     */
    upsert<T extends ProblemsOnTopicTagsUpsertArgs>(args: SelectSubset<T, ProblemsOnTopicTagsUpsertArgs<ExtArgs>>): Prisma__ProblemsOnTopicTagsClient<$Result.GetResult<Prisma.$ProblemsOnTopicTagsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ProblemsOnTopicTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemsOnTopicTagsCountArgs} args - Arguments to filter ProblemsOnTopicTags to count.
     * @example
     * // Count the number of ProblemsOnTopicTags
     * const count = await prisma.problemsOnTopicTags.count({
     *   where: {
     *     // ... the filter for the ProblemsOnTopicTags we want to count
     *   }
     * })
    **/
    count<T extends ProblemsOnTopicTagsCountArgs>(
      args?: Subset<T, ProblemsOnTopicTagsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProblemsOnTopicTagsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProblemsOnTopicTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemsOnTopicTagsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProblemsOnTopicTagsAggregateArgs>(args: Subset<T, ProblemsOnTopicTagsAggregateArgs>): Prisma.PrismaPromise<GetProblemsOnTopicTagsAggregateType<T>>

    /**
     * Group by ProblemsOnTopicTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemsOnTopicTagsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProblemsOnTopicTagsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProblemsOnTopicTagsGroupByArgs['orderBy'] }
        : { orderBy?: ProblemsOnTopicTagsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProblemsOnTopicTagsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProblemsOnTopicTagsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProblemsOnTopicTags model
   */
  readonly fields: ProblemsOnTopicTagsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProblemsOnTopicTags.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProblemsOnTopicTagsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    problem<T extends ProblemDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProblemDefaultArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    topicTag<T extends TopicTagDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TopicTagDefaultArgs<ExtArgs>>): Prisma__TopicTagClient<$Result.GetResult<Prisma.$TopicTagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ProblemsOnTopicTags model
   */
  interface ProblemsOnTopicTagsFieldRefs {
    readonly problemId: FieldRef<"ProblemsOnTopicTags", 'Int'>
    readonly topicTagId: FieldRef<"ProblemsOnTopicTags", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * ProblemsOnTopicTags findUnique
   */
  export type ProblemsOnTopicTagsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemsOnTopicTags
     */
    select?: ProblemsOnTopicTagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProblemsOnTopicTags
     */
    omit?: ProblemsOnTopicTagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemsOnTopicTagsInclude<ExtArgs> | null
    /**
     * Filter, which ProblemsOnTopicTags to fetch.
     */
    where: ProblemsOnTopicTagsWhereUniqueInput
  }

  /**
   * ProblemsOnTopicTags findUniqueOrThrow
   */
  export type ProblemsOnTopicTagsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemsOnTopicTags
     */
    select?: ProblemsOnTopicTagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProblemsOnTopicTags
     */
    omit?: ProblemsOnTopicTagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemsOnTopicTagsInclude<ExtArgs> | null
    /**
     * Filter, which ProblemsOnTopicTags to fetch.
     */
    where: ProblemsOnTopicTagsWhereUniqueInput
  }

  /**
   * ProblemsOnTopicTags findFirst
   */
  export type ProblemsOnTopicTagsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemsOnTopicTags
     */
    select?: ProblemsOnTopicTagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProblemsOnTopicTags
     */
    omit?: ProblemsOnTopicTagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemsOnTopicTagsInclude<ExtArgs> | null
    /**
     * Filter, which ProblemsOnTopicTags to fetch.
     */
    where?: ProblemsOnTopicTagsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProblemsOnTopicTags to fetch.
     */
    orderBy?: ProblemsOnTopicTagsOrderByWithRelationInput | ProblemsOnTopicTagsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProblemsOnTopicTags.
     */
    cursor?: ProblemsOnTopicTagsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProblemsOnTopicTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProblemsOnTopicTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProblemsOnTopicTags.
     */
    distinct?: ProblemsOnTopicTagsScalarFieldEnum | ProblemsOnTopicTagsScalarFieldEnum[]
  }

  /**
   * ProblemsOnTopicTags findFirstOrThrow
   */
  export type ProblemsOnTopicTagsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemsOnTopicTags
     */
    select?: ProblemsOnTopicTagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProblemsOnTopicTags
     */
    omit?: ProblemsOnTopicTagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemsOnTopicTagsInclude<ExtArgs> | null
    /**
     * Filter, which ProblemsOnTopicTags to fetch.
     */
    where?: ProblemsOnTopicTagsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProblemsOnTopicTags to fetch.
     */
    orderBy?: ProblemsOnTopicTagsOrderByWithRelationInput | ProblemsOnTopicTagsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProblemsOnTopicTags.
     */
    cursor?: ProblemsOnTopicTagsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProblemsOnTopicTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProblemsOnTopicTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProblemsOnTopicTags.
     */
    distinct?: ProblemsOnTopicTagsScalarFieldEnum | ProblemsOnTopicTagsScalarFieldEnum[]
  }

  /**
   * ProblemsOnTopicTags findMany
   */
  export type ProblemsOnTopicTagsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemsOnTopicTags
     */
    select?: ProblemsOnTopicTagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProblemsOnTopicTags
     */
    omit?: ProblemsOnTopicTagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemsOnTopicTagsInclude<ExtArgs> | null
    /**
     * Filter, which ProblemsOnTopicTags to fetch.
     */
    where?: ProblemsOnTopicTagsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProblemsOnTopicTags to fetch.
     */
    orderBy?: ProblemsOnTopicTagsOrderByWithRelationInput | ProblemsOnTopicTagsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProblemsOnTopicTags.
     */
    cursor?: ProblemsOnTopicTagsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProblemsOnTopicTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProblemsOnTopicTags.
     */
    skip?: number
    distinct?: ProblemsOnTopicTagsScalarFieldEnum | ProblemsOnTopicTagsScalarFieldEnum[]
  }

  /**
   * ProblemsOnTopicTags create
   */
  export type ProblemsOnTopicTagsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemsOnTopicTags
     */
    select?: ProblemsOnTopicTagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProblemsOnTopicTags
     */
    omit?: ProblemsOnTopicTagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemsOnTopicTagsInclude<ExtArgs> | null
    /**
     * The data needed to create a ProblemsOnTopicTags.
     */
    data: XOR<ProblemsOnTopicTagsCreateInput, ProblemsOnTopicTagsUncheckedCreateInput>
  }

  /**
   * ProblemsOnTopicTags createMany
   */
  export type ProblemsOnTopicTagsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProblemsOnTopicTags.
     */
    data: ProblemsOnTopicTagsCreateManyInput | ProblemsOnTopicTagsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProblemsOnTopicTags createManyAndReturn
   */
  export type ProblemsOnTopicTagsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemsOnTopicTags
     */
    select?: ProblemsOnTopicTagsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ProblemsOnTopicTags
     */
    omit?: ProblemsOnTopicTagsOmit<ExtArgs> | null
    /**
     * The data used to create many ProblemsOnTopicTags.
     */
    data: ProblemsOnTopicTagsCreateManyInput | ProblemsOnTopicTagsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemsOnTopicTagsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProblemsOnTopicTags update
   */
  export type ProblemsOnTopicTagsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemsOnTopicTags
     */
    select?: ProblemsOnTopicTagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProblemsOnTopicTags
     */
    omit?: ProblemsOnTopicTagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemsOnTopicTagsInclude<ExtArgs> | null
    /**
     * The data needed to update a ProblemsOnTopicTags.
     */
    data: XOR<ProblemsOnTopicTagsUpdateInput, ProblemsOnTopicTagsUncheckedUpdateInput>
    /**
     * Choose, which ProblemsOnTopicTags to update.
     */
    where: ProblemsOnTopicTagsWhereUniqueInput
  }

  /**
   * ProblemsOnTopicTags updateMany
   */
  export type ProblemsOnTopicTagsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProblemsOnTopicTags.
     */
    data: XOR<ProblemsOnTopicTagsUpdateManyMutationInput, ProblemsOnTopicTagsUncheckedUpdateManyInput>
    /**
     * Filter which ProblemsOnTopicTags to update
     */
    where?: ProblemsOnTopicTagsWhereInput
    /**
     * Limit how many ProblemsOnTopicTags to update.
     */
    limit?: number
  }

  /**
   * ProblemsOnTopicTags updateManyAndReturn
   */
  export type ProblemsOnTopicTagsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemsOnTopicTags
     */
    select?: ProblemsOnTopicTagsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ProblemsOnTopicTags
     */
    omit?: ProblemsOnTopicTagsOmit<ExtArgs> | null
    /**
     * The data used to update ProblemsOnTopicTags.
     */
    data: XOR<ProblemsOnTopicTagsUpdateManyMutationInput, ProblemsOnTopicTagsUncheckedUpdateManyInput>
    /**
     * Filter which ProblemsOnTopicTags to update
     */
    where?: ProblemsOnTopicTagsWhereInput
    /**
     * Limit how many ProblemsOnTopicTags to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemsOnTopicTagsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProblemsOnTopicTags upsert
   */
  export type ProblemsOnTopicTagsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemsOnTopicTags
     */
    select?: ProblemsOnTopicTagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProblemsOnTopicTags
     */
    omit?: ProblemsOnTopicTagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemsOnTopicTagsInclude<ExtArgs> | null
    /**
     * The filter to search for the ProblemsOnTopicTags to update in case it exists.
     */
    where: ProblemsOnTopicTagsWhereUniqueInput
    /**
     * In case the ProblemsOnTopicTags found by the `where` argument doesn't exist, create a new ProblemsOnTopicTags with this data.
     */
    create: XOR<ProblemsOnTopicTagsCreateInput, ProblemsOnTopicTagsUncheckedCreateInput>
    /**
     * In case the ProblemsOnTopicTags was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProblemsOnTopicTagsUpdateInput, ProblemsOnTopicTagsUncheckedUpdateInput>
  }

  /**
   * ProblemsOnTopicTags delete
   */
  export type ProblemsOnTopicTagsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemsOnTopicTags
     */
    select?: ProblemsOnTopicTagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProblemsOnTopicTags
     */
    omit?: ProblemsOnTopicTagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemsOnTopicTagsInclude<ExtArgs> | null
    /**
     * Filter which ProblemsOnTopicTags to delete.
     */
    where: ProblemsOnTopicTagsWhereUniqueInput
  }

  /**
   * ProblemsOnTopicTags deleteMany
   */
  export type ProblemsOnTopicTagsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProblemsOnTopicTags to delete
     */
    where?: ProblemsOnTopicTagsWhereInput
    /**
     * Limit how many ProblemsOnTopicTags to delete.
     */
    limit?: number
  }

  /**
   * ProblemsOnTopicTags without action
   */
  export type ProblemsOnTopicTagsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemsOnTopicTags
     */
    select?: ProblemsOnTopicTagsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProblemsOnTopicTags
     */
    omit?: ProblemsOnTopicTagsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemsOnTopicTagsInclude<ExtArgs> | null
  }


  /**
   * Model SheetProblem
   */

  export type AggregateSheetProblem = {
    _count: SheetProblemCountAggregateOutputType | null
    _avg: SheetProblemAvgAggregateOutputType | null
    _sum: SheetProblemSumAggregateOutputType | null
    _min: SheetProblemMinAggregateOutputType | null
    _max: SheetProblemMaxAggregateOutputType | null
  }

  export type SheetProblemAvgAggregateOutputType = {
    problemId: number | null
    sheetId: number | null
    sheetOrder: Decimal | null
    thirtyDaysOrder: Decimal | null
    threeMonthsOrder: Decimal | null
    sixMonthsOrder: Decimal | null
    yearlyOrder: Decimal | null
  }

  export type SheetProblemSumAggregateOutputType = {
    problemId: number | null
    sheetId: number | null
    sheetOrder: Decimal | null
    thirtyDaysOrder: Decimal | null
    threeMonthsOrder: Decimal | null
    sixMonthsOrder: Decimal | null
    yearlyOrder: Decimal | null
  }

  export type SheetProblemMinAggregateOutputType = {
    problemId: number | null
    sheetId: number | null
    sheetOrder: Decimal | null
    thirtyDaysOrder: Decimal | null
    threeMonthsOrder: Decimal | null
    sixMonthsOrder: Decimal | null
    yearlyOrder: Decimal | null
  }

  export type SheetProblemMaxAggregateOutputType = {
    problemId: number | null
    sheetId: number | null
    sheetOrder: Decimal | null
    thirtyDaysOrder: Decimal | null
    threeMonthsOrder: Decimal | null
    sixMonthsOrder: Decimal | null
    yearlyOrder: Decimal | null
  }

  export type SheetProblemCountAggregateOutputType = {
    problemId: number
    sheetId: number
    sheetOrder: number
    thirtyDaysOrder: number
    threeMonthsOrder: number
    sixMonthsOrder: number
    yearlyOrder: number
    _all: number
  }


  export type SheetProblemAvgAggregateInputType = {
    problemId?: true
    sheetId?: true
    sheetOrder?: true
    thirtyDaysOrder?: true
    threeMonthsOrder?: true
    sixMonthsOrder?: true
    yearlyOrder?: true
  }

  export type SheetProblemSumAggregateInputType = {
    problemId?: true
    sheetId?: true
    sheetOrder?: true
    thirtyDaysOrder?: true
    threeMonthsOrder?: true
    sixMonthsOrder?: true
    yearlyOrder?: true
  }

  export type SheetProblemMinAggregateInputType = {
    problemId?: true
    sheetId?: true
    sheetOrder?: true
    thirtyDaysOrder?: true
    threeMonthsOrder?: true
    sixMonthsOrder?: true
    yearlyOrder?: true
  }

  export type SheetProblemMaxAggregateInputType = {
    problemId?: true
    sheetId?: true
    sheetOrder?: true
    thirtyDaysOrder?: true
    threeMonthsOrder?: true
    sixMonthsOrder?: true
    yearlyOrder?: true
  }

  export type SheetProblemCountAggregateInputType = {
    problemId?: true
    sheetId?: true
    sheetOrder?: true
    thirtyDaysOrder?: true
    threeMonthsOrder?: true
    sixMonthsOrder?: true
    yearlyOrder?: true
    _all?: true
  }

  export type SheetProblemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SheetProblem to aggregate.
     */
    where?: SheetProblemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SheetProblems to fetch.
     */
    orderBy?: SheetProblemOrderByWithRelationInput | SheetProblemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SheetProblemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SheetProblems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SheetProblems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SheetProblems
    **/
    _count?: true | SheetProblemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SheetProblemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SheetProblemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SheetProblemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SheetProblemMaxAggregateInputType
  }

  export type GetSheetProblemAggregateType<T extends SheetProblemAggregateArgs> = {
        [P in keyof T & keyof AggregateSheetProblem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSheetProblem[P]>
      : GetScalarType<T[P], AggregateSheetProblem[P]>
  }




  export type SheetProblemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SheetProblemWhereInput
    orderBy?: SheetProblemOrderByWithAggregationInput | SheetProblemOrderByWithAggregationInput[]
    by: SheetProblemScalarFieldEnum[] | SheetProblemScalarFieldEnum
    having?: SheetProblemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SheetProblemCountAggregateInputType | true
    _avg?: SheetProblemAvgAggregateInputType
    _sum?: SheetProblemSumAggregateInputType
    _min?: SheetProblemMinAggregateInputType
    _max?: SheetProblemMaxAggregateInputType
  }

  export type SheetProblemGroupByOutputType = {
    problemId: number
    sheetId: number
    sheetOrder: Decimal
    thirtyDaysOrder: Decimal
    threeMonthsOrder: Decimal
    sixMonthsOrder: Decimal
    yearlyOrder: Decimal
    _count: SheetProblemCountAggregateOutputType | null
    _avg: SheetProblemAvgAggregateOutputType | null
    _sum: SheetProblemSumAggregateOutputType | null
    _min: SheetProblemMinAggregateOutputType | null
    _max: SheetProblemMaxAggregateOutputType | null
  }

  type GetSheetProblemGroupByPayload<T extends SheetProblemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SheetProblemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SheetProblemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SheetProblemGroupByOutputType[P]>
            : GetScalarType<T[P], SheetProblemGroupByOutputType[P]>
        }
      >
    >


  export type SheetProblemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    problemId?: boolean
    sheetId?: boolean
    sheetOrder?: boolean
    thirtyDaysOrder?: boolean
    threeMonthsOrder?: boolean
    sixMonthsOrder?: boolean
    yearlyOrder?: boolean
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
    sheet?: boolean | SheetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sheetProblem"]>

  export type SheetProblemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    problemId?: boolean
    sheetId?: boolean
    sheetOrder?: boolean
    thirtyDaysOrder?: boolean
    threeMonthsOrder?: boolean
    sixMonthsOrder?: boolean
    yearlyOrder?: boolean
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
    sheet?: boolean | SheetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sheetProblem"]>

  export type SheetProblemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    problemId?: boolean
    sheetId?: boolean
    sheetOrder?: boolean
    thirtyDaysOrder?: boolean
    threeMonthsOrder?: boolean
    sixMonthsOrder?: boolean
    yearlyOrder?: boolean
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
    sheet?: boolean | SheetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sheetProblem"]>

  export type SheetProblemSelectScalar = {
    problemId?: boolean
    sheetId?: boolean
    sheetOrder?: boolean
    thirtyDaysOrder?: boolean
    threeMonthsOrder?: boolean
    sixMonthsOrder?: boolean
    yearlyOrder?: boolean
  }

  export type SheetProblemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"problemId" | "sheetId" | "sheetOrder" | "thirtyDaysOrder" | "threeMonthsOrder" | "sixMonthsOrder" | "yearlyOrder", ExtArgs["result"]["sheetProblem"]>
  export type SheetProblemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
    sheet?: boolean | SheetDefaultArgs<ExtArgs>
  }
  export type SheetProblemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
    sheet?: boolean | SheetDefaultArgs<ExtArgs>
  }
  export type SheetProblemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
    sheet?: boolean | SheetDefaultArgs<ExtArgs>
  }

  export type $SheetProblemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SheetProblem"
    objects: {
      problem: Prisma.$ProblemPayload<ExtArgs>
      sheet: Prisma.$SheetPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      problemId: number
      sheetId: number
      sheetOrder: Prisma.Decimal
      thirtyDaysOrder: Prisma.Decimal
      threeMonthsOrder: Prisma.Decimal
      sixMonthsOrder: Prisma.Decimal
      yearlyOrder: Prisma.Decimal
    }, ExtArgs["result"]["sheetProblem"]>
    composites: {}
  }

  type SheetProblemGetPayload<S extends boolean | null | undefined | SheetProblemDefaultArgs> = $Result.GetResult<Prisma.$SheetProblemPayload, S>

  type SheetProblemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SheetProblemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SheetProblemCountAggregateInputType | true
    }

  export interface SheetProblemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SheetProblem'], meta: { name: 'SheetProblem' } }
    /**
     * Find zero or one SheetProblem that matches the filter.
     * @param {SheetProblemFindUniqueArgs} args - Arguments to find a SheetProblem
     * @example
     * // Get one SheetProblem
     * const sheetProblem = await prisma.sheetProblem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SheetProblemFindUniqueArgs>(args: SelectSubset<T, SheetProblemFindUniqueArgs<ExtArgs>>): Prisma__SheetProblemClient<$Result.GetResult<Prisma.$SheetProblemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SheetProblem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SheetProblemFindUniqueOrThrowArgs} args - Arguments to find a SheetProblem
     * @example
     * // Get one SheetProblem
     * const sheetProblem = await prisma.sheetProblem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SheetProblemFindUniqueOrThrowArgs>(args: SelectSubset<T, SheetProblemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SheetProblemClient<$Result.GetResult<Prisma.$SheetProblemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SheetProblem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SheetProblemFindFirstArgs} args - Arguments to find a SheetProblem
     * @example
     * // Get one SheetProblem
     * const sheetProblem = await prisma.sheetProblem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SheetProblemFindFirstArgs>(args?: SelectSubset<T, SheetProblemFindFirstArgs<ExtArgs>>): Prisma__SheetProblemClient<$Result.GetResult<Prisma.$SheetProblemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SheetProblem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SheetProblemFindFirstOrThrowArgs} args - Arguments to find a SheetProblem
     * @example
     * // Get one SheetProblem
     * const sheetProblem = await prisma.sheetProblem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SheetProblemFindFirstOrThrowArgs>(args?: SelectSubset<T, SheetProblemFindFirstOrThrowArgs<ExtArgs>>): Prisma__SheetProblemClient<$Result.GetResult<Prisma.$SheetProblemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SheetProblems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SheetProblemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SheetProblems
     * const sheetProblems = await prisma.sheetProblem.findMany()
     * 
     * // Get first 10 SheetProblems
     * const sheetProblems = await prisma.sheetProblem.findMany({ take: 10 })
     * 
     * // Only select the `problemId`
     * const sheetProblemWithProblemIdOnly = await prisma.sheetProblem.findMany({ select: { problemId: true } })
     * 
     */
    findMany<T extends SheetProblemFindManyArgs>(args?: SelectSubset<T, SheetProblemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SheetProblemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SheetProblem.
     * @param {SheetProblemCreateArgs} args - Arguments to create a SheetProblem.
     * @example
     * // Create one SheetProblem
     * const SheetProblem = await prisma.sheetProblem.create({
     *   data: {
     *     // ... data to create a SheetProblem
     *   }
     * })
     * 
     */
    create<T extends SheetProblemCreateArgs>(args: SelectSubset<T, SheetProblemCreateArgs<ExtArgs>>): Prisma__SheetProblemClient<$Result.GetResult<Prisma.$SheetProblemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SheetProblems.
     * @param {SheetProblemCreateManyArgs} args - Arguments to create many SheetProblems.
     * @example
     * // Create many SheetProblems
     * const sheetProblem = await prisma.sheetProblem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SheetProblemCreateManyArgs>(args?: SelectSubset<T, SheetProblemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SheetProblems and returns the data saved in the database.
     * @param {SheetProblemCreateManyAndReturnArgs} args - Arguments to create many SheetProblems.
     * @example
     * // Create many SheetProblems
     * const sheetProblem = await prisma.sheetProblem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SheetProblems and only return the `problemId`
     * const sheetProblemWithProblemIdOnly = await prisma.sheetProblem.createManyAndReturn({
     *   select: { problemId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SheetProblemCreateManyAndReturnArgs>(args?: SelectSubset<T, SheetProblemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SheetProblemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SheetProblem.
     * @param {SheetProblemDeleteArgs} args - Arguments to delete one SheetProblem.
     * @example
     * // Delete one SheetProblem
     * const SheetProblem = await prisma.sheetProblem.delete({
     *   where: {
     *     // ... filter to delete one SheetProblem
     *   }
     * })
     * 
     */
    delete<T extends SheetProblemDeleteArgs>(args: SelectSubset<T, SheetProblemDeleteArgs<ExtArgs>>): Prisma__SheetProblemClient<$Result.GetResult<Prisma.$SheetProblemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SheetProblem.
     * @param {SheetProblemUpdateArgs} args - Arguments to update one SheetProblem.
     * @example
     * // Update one SheetProblem
     * const sheetProblem = await prisma.sheetProblem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SheetProblemUpdateArgs>(args: SelectSubset<T, SheetProblemUpdateArgs<ExtArgs>>): Prisma__SheetProblemClient<$Result.GetResult<Prisma.$SheetProblemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SheetProblems.
     * @param {SheetProblemDeleteManyArgs} args - Arguments to filter SheetProblems to delete.
     * @example
     * // Delete a few SheetProblems
     * const { count } = await prisma.sheetProblem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SheetProblemDeleteManyArgs>(args?: SelectSubset<T, SheetProblemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SheetProblems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SheetProblemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SheetProblems
     * const sheetProblem = await prisma.sheetProblem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SheetProblemUpdateManyArgs>(args: SelectSubset<T, SheetProblemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SheetProblems and returns the data updated in the database.
     * @param {SheetProblemUpdateManyAndReturnArgs} args - Arguments to update many SheetProblems.
     * @example
     * // Update many SheetProblems
     * const sheetProblem = await prisma.sheetProblem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SheetProblems and only return the `problemId`
     * const sheetProblemWithProblemIdOnly = await prisma.sheetProblem.updateManyAndReturn({
     *   select: { problemId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SheetProblemUpdateManyAndReturnArgs>(args: SelectSubset<T, SheetProblemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SheetProblemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SheetProblem.
     * @param {SheetProblemUpsertArgs} args - Arguments to update or create a SheetProblem.
     * @example
     * // Update or create a SheetProblem
     * const sheetProblem = await prisma.sheetProblem.upsert({
     *   create: {
     *     // ... data to create a SheetProblem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SheetProblem we want to update
     *   }
     * })
     */
    upsert<T extends SheetProblemUpsertArgs>(args: SelectSubset<T, SheetProblemUpsertArgs<ExtArgs>>): Prisma__SheetProblemClient<$Result.GetResult<Prisma.$SheetProblemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SheetProblems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SheetProblemCountArgs} args - Arguments to filter SheetProblems to count.
     * @example
     * // Count the number of SheetProblems
     * const count = await prisma.sheetProblem.count({
     *   where: {
     *     // ... the filter for the SheetProblems we want to count
     *   }
     * })
    **/
    count<T extends SheetProblemCountArgs>(
      args?: Subset<T, SheetProblemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SheetProblemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SheetProblem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SheetProblemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SheetProblemAggregateArgs>(args: Subset<T, SheetProblemAggregateArgs>): Prisma.PrismaPromise<GetSheetProblemAggregateType<T>>

    /**
     * Group by SheetProblem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SheetProblemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SheetProblemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SheetProblemGroupByArgs['orderBy'] }
        : { orderBy?: SheetProblemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SheetProblemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSheetProblemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SheetProblem model
   */
  readonly fields: SheetProblemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SheetProblem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SheetProblemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    problem<T extends ProblemDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProblemDefaultArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    sheet<T extends SheetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SheetDefaultArgs<ExtArgs>>): Prisma__SheetClient<$Result.GetResult<Prisma.$SheetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SheetProblem model
   */
  interface SheetProblemFieldRefs {
    readonly problemId: FieldRef<"SheetProblem", 'Int'>
    readonly sheetId: FieldRef<"SheetProblem", 'Int'>
    readonly sheetOrder: FieldRef<"SheetProblem", 'Decimal'>
    readonly thirtyDaysOrder: FieldRef<"SheetProblem", 'Decimal'>
    readonly threeMonthsOrder: FieldRef<"SheetProblem", 'Decimal'>
    readonly sixMonthsOrder: FieldRef<"SheetProblem", 'Decimal'>
    readonly yearlyOrder: FieldRef<"SheetProblem", 'Decimal'>
  }
    

  // Custom InputTypes
  /**
   * SheetProblem findUnique
   */
  export type SheetProblemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SheetProblem
     */
    select?: SheetProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SheetProblem
     */
    omit?: SheetProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetProblemInclude<ExtArgs> | null
    /**
     * Filter, which SheetProblem to fetch.
     */
    where: SheetProblemWhereUniqueInput
  }

  /**
   * SheetProblem findUniqueOrThrow
   */
  export type SheetProblemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SheetProblem
     */
    select?: SheetProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SheetProblem
     */
    omit?: SheetProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetProblemInclude<ExtArgs> | null
    /**
     * Filter, which SheetProblem to fetch.
     */
    where: SheetProblemWhereUniqueInput
  }

  /**
   * SheetProblem findFirst
   */
  export type SheetProblemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SheetProblem
     */
    select?: SheetProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SheetProblem
     */
    omit?: SheetProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetProblemInclude<ExtArgs> | null
    /**
     * Filter, which SheetProblem to fetch.
     */
    where?: SheetProblemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SheetProblems to fetch.
     */
    orderBy?: SheetProblemOrderByWithRelationInput | SheetProblemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SheetProblems.
     */
    cursor?: SheetProblemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SheetProblems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SheetProblems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SheetProblems.
     */
    distinct?: SheetProblemScalarFieldEnum | SheetProblemScalarFieldEnum[]
  }

  /**
   * SheetProblem findFirstOrThrow
   */
  export type SheetProblemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SheetProblem
     */
    select?: SheetProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SheetProblem
     */
    omit?: SheetProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetProblemInclude<ExtArgs> | null
    /**
     * Filter, which SheetProblem to fetch.
     */
    where?: SheetProblemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SheetProblems to fetch.
     */
    orderBy?: SheetProblemOrderByWithRelationInput | SheetProblemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SheetProblems.
     */
    cursor?: SheetProblemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SheetProblems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SheetProblems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SheetProblems.
     */
    distinct?: SheetProblemScalarFieldEnum | SheetProblemScalarFieldEnum[]
  }

  /**
   * SheetProblem findMany
   */
  export type SheetProblemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SheetProblem
     */
    select?: SheetProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SheetProblem
     */
    omit?: SheetProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetProblemInclude<ExtArgs> | null
    /**
     * Filter, which SheetProblems to fetch.
     */
    where?: SheetProblemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SheetProblems to fetch.
     */
    orderBy?: SheetProblemOrderByWithRelationInput | SheetProblemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SheetProblems.
     */
    cursor?: SheetProblemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SheetProblems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SheetProblems.
     */
    skip?: number
    distinct?: SheetProblemScalarFieldEnum | SheetProblemScalarFieldEnum[]
  }

  /**
   * SheetProblem create
   */
  export type SheetProblemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SheetProblem
     */
    select?: SheetProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SheetProblem
     */
    omit?: SheetProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetProblemInclude<ExtArgs> | null
    /**
     * The data needed to create a SheetProblem.
     */
    data: XOR<SheetProblemCreateInput, SheetProblemUncheckedCreateInput>
  }

  /**
   * SheetProblem createMany
   */
  export type SheetProblemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SheetProblems.
     */
    data: SheetProblemCreateManyInput | SheetProblemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SheetProblem createManyAndReturn
   */
  export type SheetProblemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SheetProblem
     */
    select?: SheetProblemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SheetProblem
     */
    omit?: SheetProblemOmit<ExtArgs> | null
    /**
     * The data used to create many SheetProblems.
     */
    data: SheetProblemCreateManyInput | SheetProblemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetProblemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SheetProblem update
   */
  export type SheetProblemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SheetProblem
     */
    select?: SheetProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SheetProblem
     */
    omit?: SheetProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetProblemInclude<ExtArgs> | null
    /**
     * The data needed to update a SheetProblem.
     */
    data: XOR<SheetProblemUpdateInput, SheetProblemUncheckedUpdateInput>
    /**
     * Choose, which SheetProblem to update.
     */
    where: SheetProblemWhereUniqueInput
  }

  /**
   * SheetProblem updateMany
   */
  export type SheetProblemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SheetProblems.
     */
    data: XOR<SheetProblemUpdateManyMutationInput, SheetProblemUncheckedUpdateManyInput>
    /**
     * Filter which SheetProblems to update
     */
    where?: SheetProblemWhereInput
    /**
     * Limit how many SheetProblems to update.
     */
    limit?: number
  }

  /**
   * SheetProblem updateManyAndReturn
   */
  export type SheetProblemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SheetProblem
     */
    select?: SheetProblemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SheetProblem
     */
    omit?: SheetProblemOmit<ExtArgs> | null
    /**
     * The data used to update SheetProblems.
     */
    data: XOR<SheetProblemUpdateManyMutationInput, SheetProblemUncheckedUpdateManyInput>
    /**
     * Filter which SheetProblems to update
     */
    where?: SheetProblemWhereInput
    /**
     * Limit how many SheetProblems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetProblemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SheetProblem upsert
   */
  export type SheetProblemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SheetProblem
     */
    select?: SheetProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SheetProblem
     */
    omit?: SheetProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetProblemInclude<ExtArgs> | null
    /**
     * The filter to search for the SheetProblem to update in case it exists.
     */
    where: SheetProblemWhereUniqueInput
    /**
     * In case the SheetProblem found by the `where` argument doesn't exist, create a new SheetProblem with this data.
     */
    create: XOR<SheetProblemCreateInput, SheetProblemUncheckedCreateInput>
    /**
     * In case the SheetProblem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SheetProblemUpdateInput, SheetProblemUncheckedUpdateInput>
  }

  /**
   * SheetProblem delete
   */
  export type SheetProblemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SheetProblem
     */
    select?: SheetProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SheetProblem
     */
    omit?: SheetProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetProblemInclude<ExtArgs> | null
    /**
     * Filter which SheetProblem to delete.
     */
    where: SheetProblemWhereUniqueInput
  }

  /**
   * SheetProblem deleteMany
   */
  export type SheetProblemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SheetProblems to delete
     */
    where?: SheetProblemWhereInput
    /**
     * Limit how many SheetProblems to delete.
     */
    limit?: number
  }

  /**
   * SheetProblem without action
   */
  export type SheetProblemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SheetProblem
     */
    select?: SheetProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SheetProblem
     */
    omit?: SheetProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetProblemInclude<ExtArgs> | null
  }


  /**
   * Model Sheet
   */

  export type AggregateSheet = {
    _count: SheetCountAggregateOutputType | null
    _avg: SheetAvgAggregateOutputType | null
    _sum: SheetSumAggregateOutputType | null
    _min: SheetMinAggregateOutputType | null
    _max: SheetMaxAggregateOutputType | null
  }

  export type SheetAvgAggregateOutputType = {
    id: number | null
  }

  export type SheetSumAggregateOutputType = {
    id: number | null
  }

  export type SheetMinAggregateOutputType = {
    id: number | null
    slug: string | null
    name: string | null
    website: string | null
    isCompany: boolean | null
  }

  export type SheetMaxAggregateOutputType = {
    id: number | null
    slug: string | null
    name: string | null
    website: string | null
    isCompany: boolean | null
  }

  export type SheetCountAggregateOutputType = {
    id: number
    slug: number
    name: number
    website: number
    isCompany: number
    _all: number
  }


  export type SheetAvgAggregateInputType = {
    id?: true
  }

  export type SheetSumAggregateInputType = {
    id?: true
  }

  export type SheetMinAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    website?: true
    isCompany?: true
  }

  export type SheetMaxAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    website?: true
    isCompany?: true
  }

  export type SheetCountAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    website?: true
    isCompany?: true
    _all?: true
  }

  export type SheetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sheet to aggregate.
     */
    where?: SheetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sheets to fetch.
     */
    orderBy?: SheetOrderByWithRelationInput | SheetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SheetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sheets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sheets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sheets
    **/
    _count?: true | SheetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SheetAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SheetSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SheetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SheetMaxAggregateInputType
  }

  export type GetSheetAggregateType<T extends SheetAggregateArgs> = {
        [P in keyof T & keyof AggregateSheet]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSheet[P]>
      : GetScalarType<T[P], AggregateSheet[P]>
  }




  export type SheetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SheetWhereInput
    orderBy?: SheetOrderByWithAggregationInput | SheetOrderByWithAggregationInput[]
    by: SheetScalarFieldEnum[] | SheetScalarFieldEnum
    having?: SheetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SheetCountAggregateInputType | true
    _avg?: SheetAvgAggregateInputType
    _sum?: SheetSumAggregateInputType
    _min?: SheetMinAggregateInputType
    _max?: SheetMaxAggregateInputType
  }

  export type SheetGroupByOutputType = {
    id: number
    slug: string
    name: string
    website: string
    isCompany: boolean
    _count: SheetCountAggregateOutputType | null
    _avg: SheetAvgAggregateOutputType | null
    _sum: SheetSumAggregateOutputType | null
    _min: SheetMinAggregateOutputType | null
    _max: SheetMaxAggregateOutputType | null
  }

  type GetSheetGroupByPayload<T extends SheetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SheetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SheetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SheetGroupByOutputType[P]>
            : GetScalarType<T[P], SheetGroupByOutputType[P]>
        }
      >
    >


  export type SheetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    website?: boolean
    isCompany?: boolean
    SheetProblem?: boolean | Sheet$SheetProblemArgs<ExtArgs>
    _count?: boolean | SheetCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sheet"]>

  export type SheetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    website?: boolean
    isCompany?: boolean
  }, ExtArgs["result"]["sheet"]>

  export type SheetSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    website?: boolean
    isCompany?: boolean
  }, ExtArgs["result"]["sheet"]>

  export type SheetSelectScalar = {
    id?: boolean
    slug?: boolean
    name?: boolean
    website?: boolean
    isCompany?: boolean
  }

  export type SheetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "slug" | "name" | "website" | "isCompany", ExtArgs["result"]["sheet"]>
  export type SheetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    SheetProblem?: boolean | Sheet$SheetProblemArgs<ExtArgs>
    _count?: boolean | SheetCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SheetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SheetIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SheetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Sheet"
    objects: {
      SheetProblem: Prisma.$SheetProblemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      slug: string
      name: string
      website: string
      isCompany: boolean
    }, ExtArgs["result"]["sheet"]>
    composites: {}
  }

  type SheetGetPayload<S extends boolean | null | undefined | SheetDefaultArgs> = $Result.GetResult<Prisma.$SheetPayload, S>

  type SheetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SheetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SheetCountAggregateInputType | true
    }

  export interface SheetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Sheet'], meta: { name: 'Sheet' } }
    /**
     * Find zero or one Sheet that matches the filter.
     * @param {SheetFindUniqueArgs} args - Arguments to find a Sheet
     * @example
     * // Get one Sheet
     * const sheet = await prisma.sheet.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SheetFindUniqueArgs>(args: SelectSubset<T, SheetFindUniqueArgs<ExtArgs>>): Prisma__SheetClient<$Result.GetResult<Prisma.$SheetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Sheet that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SheetFindUniqueOrThrowArgs} args - Arguments to find a Sheet
     * @example
     * // Get one Sheet
     * const sheet = await prisma.sheet.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SheetFindUniqueOrThrowArgs>(args: SelectSubset<T, SheetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SheetClient<$Result.GetResult<Prisma.$SheetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sheet that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SheetFindFirstArgs} args - Arguments to find a Sheet
     * @example
     * // Get one Sheet
     * const sheet = await prisma.sheet.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SheetFindFirstArgs>(args?: SelectSubset<T, SheetFindFirstArgs<ExtArgs>>): Prisma__SheetClient<$Result.GetResult<Prisma.$SheetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sheet that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SheetFindFirstOrThrowArgs} args - Arguments to find a Sheet
     * @example
     * // Get one Sheet
     * const sheet = await prisma.sheet.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SheetFindFirstOrThrowArgs>(args?: SelectSubset<T, SheetFindFirstOrThrowArgs<ExtArgs>>): Prisma__SheetClient<$Result.GetResult<Prisma.$SheetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sheets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SheetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sheets
     * const sheets = await prisma.sheet.findMany()
     * 
     * // Get first 10 Sheets
     * const sheets = await prisma.sheet.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sheetWithIdOnly = await prisma.sheet.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SheetFindManyArgs>(args?: SelectSubset<T, SheetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SheetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Sheet.
     * @param {SheetCreateArgs} args - Arguments to create a Sheet.
     * @example
     * // Create one Sheet
     * const Sheet = await prisma.sheet.create({
     *   data: {
     *     // ... data to create a Sheet
     *   }
     * })
     * 
     */
    create<T extends SheetCreateArgs>(args: SelectSubset<T, SheetCreateArgs<ExtArgs>>): Prisma__SheetClient<$Result.GetResult<Prisma.$SheetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sheets.
     * @param {SheetCreateManyArgs} args - Arguments to create many Sheets.
     * @example
     * // Create many Sheets
     * const sheet = await prisma.sheet.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SheetCreateManyArgs>(args?: SelectSubset<T, SheetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sheets and returns the data saved in the database.
     * @param {SheetCreateManyAndReturnArgs} args - Arguments to create many Sheets.
     * @example
     * // Create many Sheets
     * const sheet = await prisma.sheet.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sheets and only return the `id`
     * const sheetWithIdOnly = await prisma.sheet.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SheetCreateManyAndReturnArgs>(args?: SelectSubset<T, SheetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SheetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Sheet.
     * @param {SheetDeleteArgs} args - Arguments to delete one Sheet.
     * @example
     * // Delete one Sheet
     * const Sheet = await prisma.sheet.delete({
     *   where: {
     *     // ... filter to delete one Sheet
     *   }
     * })
     * 
     */
    delete<T extends SheetDeleteArgs>(args: SelectSubset<T, SheetDeleteArgs<ExtArgs>>): Prisma__SheetClient<$Result.GetResult<Prisma.$SheetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Sheet.
     * @param {SheetUpdateArgs} args - Arguments to update one Sheet.
     * @example
     * // Update one Sheet
     * const sheet = await prisma.sheet.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SheetUpdateArgs>(args: SelectSubset<T, SheetUpdateArgs<ExtArgs>>): Prisma__SheetClient<$Result.GetResult<Prisma.$SheetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sheets.
     * @param {SheetDeleteManyArgs} args - Arguments to filter Sheets to delete.
     * @example
     * // Delete a few Sheets
     * const { count } = await prisma.sheet.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SheetDeleteManyArgs>(args?: SelectSubset<T, SheetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sheets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SheetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sheets
     * const sheet = await prisma.sheet.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SheetUpdateManyArgs>(args: SelectSubset<T, SheetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sheets and returns the data updated in the database.
     * @param {SheetUpdateManyAndReturnArgs} args - Arguments to update many Sheets.
     * @example
     * // Update many Sheets
     * const sheet = await prisma.sheet.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sheets and only return the `id`
     * const sheetWithIdOnly = await prisma.sheet.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SheetUpdateManyAndReturnArgs>(args: SelectSubset<T, SheetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SheetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Sheet.
     * @param {SheetUpsertArgs} args - Arguments to update or create a Sheet.
     * @example
     * // Update or create a Sheet
     * const sheet = await prisma.sheet.upsert({
     *   create: {
     *     // ... data to create a Sheet
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Sheet we want to update
     *   }
     * })
     */
    upsert<T extends SheetUpsertArgs>(args: SelectSubset<T, SheetUpsertArgs<ExtArgs>>): Prisma__SheetClient<$Result.GetResult<Prisma.$SheetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sheets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SheetCountArgs} args - Arguments to filter Sheets to count.
     * @example
     * // Count the number of Sheets
     * const count = await prisma.sheet.count({
     *   where: {
     *     // ... the filter for the Sheets we want to count
     *   }
     * })
    **/
    count<T extends SheetCountArgs>(
      args?: Subset<T, SheetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SheetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Sheet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SheetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SheetAggregateArgs>(args: Subset<T, SheetAggregateArgs>): Prisma.PrismaPromise<GetSheetAggregateType<T>>

    /**
     * Group by Sheet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SheetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SheetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SheetGroupByArgs['orderBy'] }
        : { orderBy?: SheetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SheetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSheetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Sheet model
   */
  readonly fields: SheetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Sheet.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SheetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    SheetProblem<T extends Sheet$SheetProblemArgs<ExtArgs> = {}>(args?: Subset<T, Sheet$SheetProblemArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SheetProblemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Sheet model
   */
  interface SheetFieldRefs {
    readonly id: FieldRef<"Sheet", 'Int'>
    readonly slug: FieldRef<"Sheet", 'String'>
    readonly name: FieldRef<"Sheet", 'String'>
    readonly website: FieldRef<"Sheet", 'String'>
    readonly isCompany: FieldRef<"Sheet", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Sheet findUnique
   */
  export type SheetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sheet
     */
    select?: SheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sheet
     */
    omit?: SheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetInclude<ExtArgs> | null
    /**
     * Filter, which Sheet to fetch.
     */
    where: SheetWhereUniqueInput
  }

  /**
   * Sheet findUniqueOrThrow
   */
  export type SheetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sheet
     */
    select?: SheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sheet
     */
    omit?: SheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetInclude<ExtArgs> | null
    /**
     * Filter, which Sheet to fetch.
     */
    where: SheetWhereUniqueInput
  }

  /**
   * Sheet findFirst
   */
  export type SheetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sheet
     */
    select?: SheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sheet
     */
    omit?: SheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetInclude<ExtArgs> | null
    /**
     * Filter, which Sheet to fetch.
     */
    where?: SheetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sheets to fetch.
     */
    orderBy?: SheetOrderByWithRelationInput | SheetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sheets.
     */
    cursor?: SheetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sheets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sheets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sheets.
     */
    distinct?: SheetScalarFieldEnum | SheetScalarFieldEnum[]
  }

  /**
   * Sheet findFirstOrThrow
   */
  export type SheetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sheet
     */
    select?: SheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sheet
     */
    omit?: SheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetInclude<ExtArgs> | null
    /**
     * Filter, which Sheet to fetch.
     */
    where?: SheetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sheets to fetch.
     */
    orderBy?: SheetOrderByWithRelationInput | SheetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sheets.
     */
    cursor?: SheetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sheets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sheets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sheets.
     */
    distinct?: SheetScalarFieldEnum | SheetScalarFieldEnum[]
  }

  /**
   * Sheet findMany
   */
  export type SheetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sheet
     */
    select?: SheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sheet
     */
    omit?: SheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetInclude<ExtArgs> | null
    /**
     * Filter, which Sheets to fetch.
     */
    where?: SheetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sheets to fetch.
     */
    orderBy?: SheetOrderByWithRelationInput | SheetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sheets.
     */
    cursor?: SheetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sheets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sheets.
     */
    skip?: number
    distinct?: SheetScalarFieldEnum | SheetScalarFieldEnum[]
  }

  /**
   * Sheet create
   */
  export type SheetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sheet
     */
    select?: SheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sheet
     */
    omit?: SheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetInclude<ExtArgs> | null
    /**
     * The data needed to create a Sheet.
     */
    data: XOR<SheetCreateInput, SheetUncheckedCreateInput>
  }

  /**
   * Sheet createMany
   */
  export type SheetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sheets.
     */
    data: SheetCreateManyInput | SheetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Sheet createManyAndReturn
   */
  export type SheetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sheet
     */
    select?: SheetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Sheet
     */
    omit?: SheetOmit<ExtArgs> | null
    /**
     * The data used to create many Sheets.
     */
    data: SheetCreateManyInput | SheetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Sheet update
   */
  export type SheetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sheet
     */
    select?: SheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sheet
     */
    omit?: SheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetInclude<ExtArgs> | null
    /**
     * The data needed to update a Sheet.
     */
    data: XOR<SheetUpdateInput, SheetUncheckedUpdateInput>
    /**
     * Choose, which Sheet to update.
     */
    where: SheetWhereUniqueInput
  }

  /**
   * Sheet updateMany
   */
  export type SheetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sheets.
     */
    data: XOR<SheetUpdateManyMutationInput, SheetUncheckedUpdateManyInput>
    /**
     * Filter which Sheets to update
     */
    where?: SheetWhereInput
    /**
     * Limit how many Sheets to update.
     */
    limit?: number
  }

  /**
   * Sheet updateManyAndReturn
   */
  export type SheetUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sheet
     */
    select?: SheetSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Sheet
     */
    omit?: SheetOmit<ExtArgs> | null
    /**
     * The data used to update Sheets.
     */
    data: XOR<SheetUpdateManyMutationInput, SheetUncheckedUpdateManyInput>
    /**
     * Filter which Sheets to update
     */
    where?: SheetWhereInput
    /**
     * Limit how many Sheets to update.
     */
    limit?: number
  }

  /**
   * Sheet upsert
   */
  export type SheetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sheet
     */
    select?: SheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sheet
     */
    omit?: SheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetInclude<ExtArgs> | null
    /**
     * The filter to search for the Sheet to update in case it exists.
     */
    where: SheetWhereUniqueInput
    /**
     * In case the Sheet found by the `where` argument doesn't exist, create a new Sheet with this data.
     */
    create: XOR<SheetCreateInput, SheetUncheckedCreateInput>
    /**
     * In case the Sheet was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SheetUpdateInput, SheetUncheckedUpdateInput>
  }

  /**
   * Sheet delete
   */
  export type SheetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sheet
     */
    select?: SheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sheet
     */
    omit?: SheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetInclude<ExtArgs> | null
    /**
     * Filter which Sheet to delete.
     */
    where: SheetWhereUniqueInput
  }

  /**
   * Sheet deleteMany
   */
  export type SheetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sheets to delete
     */
    where?: SheetWhereInput
    /**
     * Limit how many Sheets to delete.
     */
    limit?: number
  }

  /**
   * Sheet.SheetProblem
   */
  export type Sheet$SheetProblemArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SheetProblem
     */
    select?: SheetProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SheetProblem
     */
    omit?: SheetProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetProblemInclude<ExtArgs> | null
    where?: SheetProblemWhereInput
    orderBy?: SheetProblemOrderByWithRelationInput | SheetProblemOrderByWithRelationInput[]
    cursor?: SheetProblemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SheetProblemScalarFieldEnum | SheetProblemScalarFieldEnum[]
  }

  /**
   * Sheet without action
   */
  export type SheetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sheet
     */
    select?: SheetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Sheet
     */
    omit?: SheetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SheetInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ProblemScalarFieldEnum: {
    id: 'id',
    title: 'title',
    url: 'url',
    difficulty: 'difficulty',
    difficultyOrder: 'difficultyOrder',
    acceptance: 'acceptance',
    isPaid: 'isPaid'
  };

  export type ProblemScalarFieldEnum = (typeof ProblemScalarFieldEnum)[keyof typeof ProblemScalarFieldEnum]


  export const TopicTagScalarFieldEnum: {
    id: 'id',
    slug: 'slug',
    name: 'name'
  };

  export type TopicTagScalarFieldEnum = (typeof TopicTagScalarFieldEnum)[keyof typeof TopicTagScalarFieldEnum]


  export const ProblemsOnTopicTagsScalarFieldEnum: {
    problemId: 'problemId',
    topicTagId: 'topicTagId'
  };

  export type ProblemsOnTopicTagsScalarFieldEnum = (typeof ProblemsOnTopicTagsScalarFieldEnum)[keyof typeof ProblemsOnTopicTagsScalarFieldEnum]


  export const SheetProblemScalarFieldEnum: {
    problemId: 'problemId',
    sheetId: 'sheetId',
    sheetOrder: 'sheetOrder',
    thirtyDaysOrder: 'thirtyDaysOrder',
    threeMonthsOrder: 'threeMonthsOrder',
    sixMonthsOrder: 'sixMonthsOrder',
    yearlyOrder: 'yearlyOrder'
  };

  export type SheetProblemScalarFieldEnum = (typeof SheetProblemScalarFieldEnum)[keyof typeof SheetProblemScalarFieldEnum]


  export const SheetScalarFieldEnum: {
    id: 'id',
    slug: 'slug',
    name: 'name',
    website: 'website',
    isCompany: 'isCompany'
  };

  export type SheetScalarFieldEnum = (typeof SheetScalarFieldEnum)[keyof typeof SheetScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ProblemWhereInput = {
    AND?: ProblemWhereInput | ProblemWhereInput[]
    OR?: ProblemWhereInput[]
    NOT?: ProblemWhereInput | ProblemWhereInput[]
    id?: IntFilter<"Problem"> | number
    title?: StringFilter<"Problem"> | string
    url?: StringFilter<"Problem"> | string
    difficulty?: StringFilter<"Problem"> | string
    difficultyOrder?: IntFilter<"Problem"> | number
    acceptance?: IntFilter<"Problem"> | number
    isPaid?: BoolFilter<"Problem"> | boolean
    topicTags?: ProblemsOnTopicTagsListRelationFilter
    SheetProblem?: SheetProblemListRelationFilter
  }

  export type ProblemOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    url?: SortOrder
    difficulty?: SortOrder
    difficultyOrder?: SortOrder
    acceptance?: SortOrder
    isPaid?: SortOrder
    topicTags?: ProblemsOnTopicTagsOrderByRelationAggregateInput
    SheetProblem?: SheetProblemOrderByRelationAggregateInput
  }

  export type ProblemWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    url?: string
    AND?: ProblemWhereInput | ProblemWhereInput[]
    OR?: ProblemWhereInput[]
    NOT?: ProblemWhereInput | ProblemWhereInput[]
    title?: StringFilter<"Problem"> | string
    difficulty?: StringFilter<"Problem"> | string
    difficultyOrder?: IntFilter<"Problem"> | number
    acceptance?: IntFilter<"Problem"> | number
    isPaid?: BoolFilter<"Problem"> | boolean
    topicTags?: ProblemsOnTopicTagsListRelationFilter
    SheetProblem?: SheetProblemListRelationFilter
  }, "id" | "url">

  export type ProblemOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    url?: SortOrder
    difficulty?: SortOrder
    difficultyOrder?: SortOrder
    acceptance?: SortOrder
    isPaid?: SortOrder
    _count?: ProblemCountOrderByAggregateInput
    _avg?: ProblemAvgOrderByAggregateInput
    _max?: ProblemMaxOrderByAggregateInput
    _min?: ProblemMinOrderByAggregateInput
    _sum?: ProblemSumOrderByAggregateInput
  }

  export type ProblemScalarWhereWithAggregatesInput = {
    AND?: ProblemScalarWhereWithAggregatesInput | ProblemScalarWhereWithAggregatesInput[]
    OR?: ProblemScalarWhereWithAggregatesInput[]
    NOT?: ProblemScalarWhereWithAggregatesInput | ProblemScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Problem"> | number
    title?: StringWithAggregatesFilter<"Problem"> | string
    url?: StringWithAggregatesFilter<"Problem"> | string
    difficulty?: StringWithAggregatesFilter<"Problem"> | string
    difficultyOrder?: IntWithAggregatesFilter<"Problem"> | number
    acceptance?: IntWithAggregatesFilter<"Problem"> | number
    isPaid?: BoolWithAggregatesFilter<"Problem"> | boolean
  }

  export type TopicTagWhereInput = {
    AND?: TopicTagWhereInput | TopicTagWhereInput[]
    OR?: TopicTagWhereInput[]
    NOT?: TopicTagWhereInput | TopicTagWhereInput[]
    id?: IntFilter<"TopicTag"> | number
    slug?: StringFilter<"TopicTag"> | string
    name?: StringFilter<"TopicTag"> | string
    problems?: ProblemsOnTopicTagsListRelationFilter
  }

  export type TopicTagOrderByWithRelationInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    problems?: ProblemsOnTopicTagsOrderByRelationAggregateInput
  }

  export type TopicTagWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    slug?: string
    AND?: TopicTagWhereInput | TopicTagWhereInput[]
    OR?: TopicTagWhereInput[]
    NOT?: TopicTagWhereInput | TopicTagWhereInput[]
    name?: StringFilter<"TopicTag"> | string
    problems?: ProblemsOnTopicTagsListRelationFilter
  }, "id" | "slug">

  export type TopicTagOrderByWithAggregationInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    _count?: TopicTagCountOrderByAggregateInput
    _avg?: TopicTagAvgOrderByAggregateInput
    _max?: TopicTagMaxOrderByAggregateInput
    _min?: TopicTagMinOrderByAggregateInput
    _sum?: TopicTagSumOrderByAggregateInput
  }

  export type TopicTagScalarWhereWithAggregatesInput = {
    AND?: TopicTagScalarWhereWithAggregatesInput | TopicTagScalarWhereWithAggregatesInput[]
    OR?: TopicTagScalarWhereWithAggregatesInput[]
    NOT?: TopicTagScalarWhereWithAggregatesInput | TopicTagScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"TopicTag"> | number
    slug?: StringWithAggregatesFilter<"TopicTag"> | string
    name?: StringWithAggregatesFilter<"TopicTag"> | string
  }

  export type ProblemsOnTopicTagsWhereInput = {
    AND?: ProblemsOnTopicTagsWhereInput | ProblemsOnTopicTagsWhereInput[]
    OR?: ProblemsOnTopicTagsWhereInput[]
    NOT?: ProblemsOnTopicTagsWhereInput | ProblemsOnTopicTagsWhereInput[]
    problemId?: IntFilter<"ProblemsOnTopicTags"> | number
    topicTagId?: IntFilter<"ProblemsOnTopicTags"> | number
    problem?: XOR<ProblemScalarRelationFilter, ProblemWhereInput>
    topicTag?: XOR<TopicTagScalarRelationFilter, TopicTagWhereInput>
  }

  export type ProblemsOnTopicTagsOrderByWithRelationInput = {
    problemId?: SortOrder
    topicTagId?: SortOrder
    problem?: ProblemOrderByWithRelationInput
    topicTag?: TopicTagOrderByWithRelationInput
  }

  export type ProblemsOnTopicTagsWhereUniqueInput = Prisma.AtLeast<{
    problemId_topicTagId?: ProblemsOnTopicTagsProblemIdTopicTagIdCompoundUniqueInput
    AND?: ProblemsOnTopicTagsWhereInput | ProblemsOnTopicTagsWhereInput[]
    OR?: ProblemsOnTopicTagsWhereInput[]
    NOT?: ProblemsOnTopicTagsWhereInput | ProblemsOnTopicTagsWhereInput[]
    problemId?: IntFilter<"ProblemsOnTopicTags"> | number
    topicTagId?: IntFilter<"ProblemsOnTopicTags"> | number
    problem?: XOR<ProblemScalarRelationFilter, ProblemWhereInput>
    topicTag?: XOR<TopicTagScalarRelationFilter, TopicTagWhereInput>
  }, "problemId_topicTagId">

  export type ProblemsOnTopicTagsOrderByWithAggregationInput = {
    problemId?: SortOrder
    topicTagId?: SortOrder
    _count?: ProblemsOnTopicTagsCountOrderByAggregateInput
    _avg?: ProblemsOnTopicTagsAvgOrderByAggregateInput
    _max?: ProblemsOnTopicTagsMaxOrderByAggregateInput
    _min?: ProblemsOnTopicTagsMinOrderByAggregateInput
    _sum?: ProblemsOnTopicTagsSumOrderByAggregateInput
  }

  export type ProblemsOnTopicTagsScalarWhereWithAggregatesInput = {
    AND?: ProblemsOnTopicTagsScalarWhereWithAggregatesInput | ProblemsOnTopicTagsScalarWhereWithAggregatesInput[]
    OR?: ProblemsOnTopicTagsScalarWhereWithAggregatesInput[]
    NOT?: ProblemsOnTopicTagsScalarWhereWithAggregatesInput | ProblemsOnTopicTagsScalarWhereWithAggregatesInput[]
    problemId?: IntWithAggregatesFilter<"ProblemsOnTopicTags"> | number
    topicTagId?: IntWithAggregatesFilter<"ProblemsOnTopicTags"> | number
  }

  export type SheetProblemWhereInput = {
    AND?: SheetProblemWhereInput | SheetProblemWhereInput[]
    OR?: SheetProblemWhereInput[]
    NOT?: SheetProblemWhereInput | SheetProblemWhereInput[]
    problemId?: IntFilter<"SheetProblem"> | number
    sheetId?: IntFilter<"SheetProblem"> | number
    sheetOrder?: DecimalFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: DecimalFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: DecimalFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: DecimalFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    yearlyOrder?: DecimalFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    problem?: XOR<ProblemScalarRelationFilter, ProblemWhereInput>
    sheet?: XOR<SheetScalarRelationFilter, SheetWhereInput>
  }

  export type SheetProblemOrderByWithRelationInput = {
    problemId?: SortOrder
    sheetId?: SortOrder
    sheetOrder?: SortOrder
    thirtyDaysOrder?: SortOrder
    threeMonthsOrder?: SortOrder
    sixMonthsOrder?: SortOrder
    yearlyOrder?: SortOrder
    problem?: ProblemOrderByWithRelationInput
    sheet?: SheetOrderByWithRelationInput
  }

  export type SheetProblemWhereUniqueInput = Prisma.AtLeast<{
    problemId_sheetId?: SheetProblemProblemIdSheetIdCompoundUniqueInput
    AND?: SheetProblemWhereInput | SheetProblemWhereInput[]
    OR?: SheetProblemWhereInput[]
    NOT?: SheetProblemWhereInput | SheetProblemWhereInput[]
    problemId?: IntFilter<"SheetProblem"> | number
    sheetId?: IntFilter<"SheetProblem"> | number
    sheetOrder?: DecimalFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: DecimalFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: DecimalFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: DecimalFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    yearlyOrder?: DecimalFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    problem?: XOR<ProblemScalarRelationFilter, ProblemWhereInput>
    sheet?: XOR<SheetScalarRelationFilter, SheetWhereInput>
  }, "problemId_sheetId">

  export type SheetProblemOrderByWithAggregationInput = {
    problemId?: SortOrder
    sheetId?: SortOrder
    sheetOrder?: SortOrder
    thirtyDaysOrder?: SortOrder
    threeMonthsOrder?: SortOrder
    sixMonthsOrder?: SortOrder
    yearlyOrder?: SortOrder
    _count?: SheetProblemCountOrderByAggregateInput
    _avg?: SheetProblemAvgOrderByAggregateInput
    _max?: SheetProblemMaxOrderByAggregateInput
    _min?: SheetProblemMinOrderByAggregateInput
    _sum?: SheetProblemSumOrderByAggregateInput
  }

  export type SheetProblemScalarWhereWithAggregatesInput = {
    AND?: SheetProblemScalarWhereWithAggregatesInput | SheetProblemScalarWhereWithAggregatesInput[]
    OR?: SheetProblemScalarWhereWithAggregatesInput[]
    NOT?: SheetProblemScalarWhereWithAggregatesInput | SheetProblemScalarWhereWithAggregatesInput[]
    problemId?: IntWithAggregatesFilter<"SheetProblem"> | number
    sheetId?: IntWithAggregatesFilter<"SheetProblem"> | number
    sheetOrder?: DecimalWithAggregatesFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: DecimalWithAggregatesFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: DecimalWithAggregatesFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: DecimalWithAggregatesFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    yearlyOrder?: DecimalWithAggregatesFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
  }

  export type SheetWhereInput = {
    AND?: SheetWhereInput | SheetWhereInput[]
    OR?: SheetWhereInput[]
    NOT?: SheetWhereInput | SheetWhereInput[]
    id?: IntFilter<"Sheet"> | number
    slug?: StringFilter<"Sheet"> | string
    name?: StringFilter<"Sheet"> | string
    website?: StringFilter<"Sheet"> | string
    isCompany?: BoolFilter<"Sheet"> | boolean
    SheetProblem?: SheetProblemListRelationFilter
  }

  export type SheetOrderByWithRelationInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    website?: SortOrder
    isCompany?: SortOrder
    SheetProblem?: SheetProblemOrderByRelationAggregateInput
  }

  export type SheetWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    slug?: string
    AND?: SheetWhereInput | SheetWhereInput[]
    OR?: SheetWhereInput[]
    NOT?: SheetWhereInput | SheetWhereInput[]
    name?: StringFilter<"Sheet"> | string
    website?: StringFilter<"Sheet"> | string
    isCompany?: BoolFilter<"Sheet"> | boolean
    SheetProblem?: SheetProblemListRelationFilter
  }, "id" | "slug">

  export type SheetOrderByWithAggregationInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    website?: SortOrder
    isCompany?: SortOrder
    _count?: SheetCountOrderByAggregateInput
    _avg?: SheetAvgOrderByAggregateInput
    _max?: SheetMaxOrderByAggregateInput
    _min?: SheetMinOrderByAggregateInput
    _sum?: SheetSumOrderByAggregateInput
  }

  export type SheetScalarWhereWithAggregatesInput = {
    AND?: SheetScalarWhereWithAggregatesInput | SheetScalarWhereWithAggregatesInput[]
    OR?: SheetScalarWhereWithAggregatesInput[]
    NOT?: SheetScalarWhereWithAggregatesInput | SheetScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Sheet"> | number
    slug?: StringWithAggregatesFilter<"Sheet"> | string
    name?: StringWithAggregatesFilter<"Sheet"> | string
    website?: StringWithAggregatesFilter<"Sheet"> | string
    isCompany?: BoolWithAggregatesFilter<"Sheet"> | boolean
  }

  export type ProblemCreateInput = {
    title: string
    url: string
    difficulty: string
    difficultyOrder?: number
    acceptance?: number
    isPaid: boolean
    topicTags?: ProblemsOnTopicTagsCreateNestedManyWithoutProblemInput
    SheetProblem?: SheetProblemCreateNestedManyWithoutProblemInput
  }

  export type ProblemUncheckedCreateInput = {
    id?: number
    title: string
    url: string
    difficulty: string
    difficultyOrder?: number
    acceptance?: number
    isPaid: boolean
    topicTags?: ProblemsOnTopicTagsUncheckedCreateNestedManyWithoutProblemInput
    SheetProblem?: SheetProblemUncheckedCreateNestedManyWithoutProblemInput
  }

  export type ProblemUpdateInput = {
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    difficultyOrder?: IntFieldUpdateOperationsInput | number
    acceptance?: IntFieldUpdateOperationsInput | number
    isPaid?: BoolFieldUpdateOperationsInput | boolean
    topicTags?: ProblemsOnTopicTagsUpdateManyWithoutProblemNestedInput
    SheetProblem?: SheetProblemUpdateManyWithoutProblemNestedInput
  }

  export type ProblemUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    difficultyOrder?: IntFieldUpdateOperationsInput | number
    acceptance?: IntFieldUpdateOperationsInput | number
    isPaid?: BoolFieldUpdateOperationsInput | boolean
    topicTags?: ProblemsOnTopicTagsUncheckedUpdateManyWithoutProblemNestedInput
    SheetProblem?: SheetProblemUncheckedUpdateManyWithoutProblemNestedInput
  }

  export type ProblemCreateManyInput = {
    id?: number
    title: string
    url: string
    difficulty: string
    difficultyOrder?: number
    acceptance?: number
    isPaid: boolean
  }

  export type ProblemUpdateManyMutationInput = {
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    difficultyOrder?: IntFieldUpdateOperationsInput | number
    acceptance?: IntFieldUpdateOperationsInput | number
    isPaid?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ProblemUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    difficultyOrder?: IntFieldUpdateOperationsInput | number
    acceptance?: IntFieldUpdateOperationsInput | number
    isPaid?: BoolFieldUpdateOperationsInput | boolean
  }

  export type TopicTagCreateInput = {
    slug: string
    name: string
    problems?: ProblemsOnTopicTagsCreateNestedManyWithoutTopicTagInput
  }

  export type TopicTagUncheckedCreateInput = {
    id?: number
    slug: string
    name: string
    problems?: ProblemsOnTopicTagsUncheckedCreateNestedManyWithoutTopicTagInput
  }

  export type TopicTagUpdateInput = {
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    problems?: ProblemsOnTopicTagsUpdateManyWithoutTopicTagNestedInput
  }

  export type TopicTagUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    problems?: ProblemsOnTopicTagsUncheckedUpdateManyWithoutTopicTagNestedInput
  }

  export type TopicTagCreateManyInput = {
    id?: number
    slug: string
    name: string
  }

  export type TopicTagUpdateManyMutationInput = {
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type TopicTagUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type ProblemsOnTopicTagsCreateInput = {
    problem: ProblemCreateNestedOneWithoutTopicTagsInput
    topicTag: TopicTagCreateNestedOneWithoutProblemsInput
  }

  export type ProblemsOnTopicTagsUncheckedCreateInput = {
    problemId: number
    topicTagId: number
  }

  export type ProblemsOnTopicTagsUpdateInput = {
    problem?: ProblemUpdateOneRequiredWithoutTopicTagsNestedInput
    topicTag?: TopicTagUpdateOneRequiredWithoutProblemsNestedInput
  }

  export type ProblemsOnTopicTagsUncheckedUpdateInput = {
    problemId?: IntFieldUpdateOperationsInput | number
    topicTagId?: IntFieldUpdateOperationsInput | number
  }

  export type ProblemsOnTopicTagsCreateManyInput = {
    problemId: number
    topicTagId: number
  }

  export type ProblemsOnTopicTagsUpdateManyMutationInput = {

  }

  export type ProblemsOnTopicTagsUncheckedUpdateManyInput = {
    problemId?: IntFieldUpdateOperationsInput | number
    topicTagId?: IntFieldUpdateOperationsInput | number
  }

  export type SheetProblemCreateInput = {
    sheetOrder?: Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: Decimal | DecimalJsLike | number | string
    yearlyOrder?: Decimal | DecimalJsLike | number | string
    problem: ProblemCreateNestedOneWithoutSheetProblemInput
    sheet: SheetCreateNestedOneWithoutSheetProblemInput
  }

  export type SheetProblemUncheckedCreateInput = {
    problemId: number
    sheetId: number
    sheetOrder?: Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: Decimal | DecimalJsLike | number | string
    yearlyOrder?: Decimal | DecimalJsLike | number | string
  }

  export type SheetProblemUpdateInput = {
    sheetOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    yearlyOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    problem?: ProblemUpdateOneRequiredWithoutSheetProblemNestedInput
    sheet?: SheetUpdateOneRequiredWithoutSheetProblemNestedInput
  }

  export type SheetProblemUncheckedUpdateInput = {
    problemId?: IntFieldUpdateOperationsInput | number
    sheetId?: IntFieldUpdateOperationsInput | number
    sheetOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    yearlyOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type SheetProblemCreateManyInput = {
    problemId: number
    sheetId: number
    sheetOrder?: Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: Decimal | DecimalJsLike | number | string
    yearlyOrder?: Decimal | DecimalJsLike | number | string
  }

  export type SheetProblemUpdateManyMutationInput = {
    sheetOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    yearlyOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type SheetProblemUncheckedUpdateManyInput = {
    problemId?: IntFieldUpdateOperationsInput | number
    sheetId?: IntFieldUpdateOperationsInput | number
    sheetOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    yearlyOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type SheetCreateInput = {
    slug: string
    name: string
    website?: string
    isCompany?: boolean
    SheetProblem?: SheetProblemCreateNestedManyWithoutSheetInput
  }

  export type SheetUncheckedCreateInput = {
    id?: number
    slug: string
    name: string
    website?: string
    isCompany?: boolean
    SheetProblem?: SheetProblemUncheckedCreateNestedManyWithoutSheetInput
  }

  export type SheetUpdateInput = {
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    isCompany?: BoolFieldUpdateOperationsInput | boolean
    SheetProblem?: SheetProblemUpdateManyWithoutSheetNestedInput
  }

  export type SheetUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    isCompany?: BoolFieldUpdateOperationsInput | boolean
    SheetProblem?: SheetProblemUncheckedUpdateManyWithoutSheetNestedInput
  }

  export type SheetCreateManyInput = {
    id?: number
    slug: string
    name: string
    website?: string
    isCompany?: boolean
  }

  export type SheetUpdateManyMutationInput = {
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    isCompany?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SheetUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    isCompany?: BoolFieldUpdateOperationsInput | boolean
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ProblemsOnTopicTagsListRelationFilter = {
    every?: ProblemsOnTopicTagsWhereInput
    some?: ProblemsOnTopicTagsWhereInput
    none?: ProblemsOnTopicTagsWhereInput
  }

  export type SheetProblemListRelationFilter = {
    every?: SheetProblemWhereInput
    some?: SheetProblemWhereInput
    none?: SheetProblemWhereInput
  }

  export type ProblemsOnTopicTagsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SheetProblemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProblemCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    url?: SortOrder
    difficulty?: SortOrder
    difficultyOrder?: SortOrder
    acceptance?: SortOrder
    isPaid?: SortOrder
  }

  export type ProblemAvgOrderByAggregateInput = {
    id?: SortOrder
    difficultyOrder?: SortOrder
    acceptance?: SortOrder
  }

  export type ProblemMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    url?: SortOrder
    difficulty?: SortOrder
    difficultyOrder?: SortOrder
    acceptance?: SortOrder
    isPaid?: SortOrder
  }

  export type ProblemMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    url?: SortOrder
    difficulty?: SortOrder
    difficultyOrder?: SortOrder
    acceptance?: SortOrder
    isPaid?: SortOrder
  }

  export type ProblemSumOrderByAggregateInput = {
    id?: SortOrder
    difficultyOrder?: SortOrder
    acceptance?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type TopicTagCountOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
  }

  export type TopicTagAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type TopicTagMaxOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
  }

  export type TopicTagMinOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
  }

  export type TopicTagSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type ProblemScalarRelationFilter = {
    is?: ProblemWhereInput
    isNot?: ProblemWhereInput
  }

  export type TopicTagScalarRelationFilter = {
    is?: TopicTagWhereInput
    isNot?: TopicTagWhereInput
  }

  export type ProblemsOnTopicTagsProblemIdTopicTagIdCompoundUniqueInput = {
    problemId: number
    topicTagId: number
  }

  export type ProblemsOnTopicTagsCountOrderByAggregateInput = {
    problemId?: SortOrder
    topicTagId?: SortOrder
  }

  export type ProblemsOnTopicTagsAvgOrderByAggregateInput = {
    problemId?: SortOrder
    topicTagId?: SortOrder
  }

  export type ProblemsOnTopicTagsMaxOrderByAggregateInput = {
    problemId?: SortOrder
    topicTagId?: SortOrder
  }

  export type ProblemsOnTopicTagsMinOrderByAggregateInput = {
    problemId?: SortOrder
    topicTagId?: SortOrder
  }

  export type ProblemsOnTopicTagsSumOrderByAggregateInput = {
    problemId?: SortOrder
    topicTagId?: SortOrder
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type SheetScalarRelationFilter = {
    is?: SheetWhereInput
    isNot?: SheetWhereInput
  }

  export type SheetProblemProblemIdSheetIdCompoundUniqueInput = {
    problemId: number
    sheetId: number
  }

  export type SheetProblemCountOrderByAggregateInput = {
    problemId?: SortOrder
    sheetId?: SortOrder
    sheetOrder?: SortOrder
    thirtyDaysOrder?: SortOrder
    threeMonthsOrder?: SortOrder
    sixMonthsOrder?: SortOrder
    yearlyOrder?: SortOrder
  }

  export type SheetProblemAvgOrderByAggregateInput = {
    problemId?: SortOrder
    sheetId?: SortOrder
    sheetOrder?: SortOrder
    thirtyDaysOrder?: SortOrder
    threeMonthsOrder?: SortOrder
    sixMonthsOrder?: SortOrder
    yearlyOrder?: SortOrder
  }

  export type SheetProblemMaxOrderByAggregateInput = {
    problemId?: SortOrder
    sheetId?: SortOrder
    sheetOrder?: SortOrder
    thirtyDaysOrder?: SortOrder
    threeMonthsOrder?: SortOrder
    sixMonthsOrder?: SortOrder
    yearlyOrder?: SortOrder
  }

  export type SheetProblemMinOrderByAggregateInput = {
    problemId?: SortOrder
    sheetId?: SortOrder
    sheetOrder?: SortOrder
    thirtyDaysOrder?: SortOrder
    threeMonthsOrder?: SortOrder
    sixMonthsOrder?: SortOrder
    yearlyOrder?: SortOrder
  }

  export type SheetProblemSumOrderByAggregateInput = {
    problemId?: SortOrder
    sheetId?: SortOrder
    sheetOrder?: SortOrder
    thirtyDaysOrder?: SortOrder
    threeMonthsOrder?: SortOrder
    sixMonthsOrder?: SortOrder
    yearlyOrder?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type SheetCountOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    website?: SortOrder
    isCompany?: SortOrder
  }

  export type SheetAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type SheetMaxOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    website?: SortOrder
    isCompany?: SortOrder
  }

  export type SheetMinOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    website?: SortOrder
    isCompany?: SortOrder
  }

  export type SheetSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type ProblemsOnTopicTagsCreateNestedManyWithoutProblemInput = {
    create?: XOR<ProblemsOnTopicTagsCreateWithoutProblemInput, ProblemsOnTopicTagsUncheckedCreateWithoutProblemInput> | ProblemsOnTopicTagsCreateWithoutProblemInput[] | ProblemsOnTopicTagsUncheckedCreateWithoutProblemInput[]
    connectOrCreate?: ProblemsOnTopicTagsCreateOrConnectWithoutProblemInput | ProblemsOnTopicTagsCreateOrConnectWithoutProblemInput[]
    createMany?: ProblemsOnTopicTagsCreateManyProblemInputEnvelope
    connect?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
  }

  export type SheetProblemCreateNestedManyWithoutProblemInput = {
    create?: XOR<SheetProblemCreateWithoutProblemInput, SheetProblemUncheckedCreateWithoutProblemInput> | SheetProblemCreateWithoutProblemInput[] | SheetProblemUncheckedCreateWithoutProblemInput[]
    connectOrCreate?: SheetProblemCreateOrConnectWithoutProblemInput | SheetProblemCreateOrConnectWithoutProblemInput[]
    createMany?: SheetProblemCreateManyProblemInputEnvelope
    connect?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
  }

  export type ProblemsOnTopicTagsUncheckedCreateNestedManyWithoutProblemInput = {
    create?: XOR<ProblemsOnTopicTagsCreateWithoutProblemInput, ProblemsOnTopicTagsUncheckedCreateWithoutProblemInput> | ProblemsOnTopicTagsCreateWithoutProblemInput[] | ProblemsOnTopicTagsUncheckedCreateWithoutProblemInput[]
    connectOrCreate?: ProblemsOnTopicTagsCreateOrConnectWithoutProblemInput | ProblemsOnTopicTagsCreateOrConnectWithoutProblemInput[]
    createMany?: ProblemsOnTopicTagsCreateManyProblemInputEnvelope
    connect?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
  }

  export type SheetProblemUncheckedCreateNestedManyWithoutProblemInput = {
    create?: XOR<SheetProblemCreateWithoutProblemInput, SheetProblemUncheckedCreateWithoutProblemInput> | SheetProblemCreateWithoutProblemInput[] | SheetProblemUncheckedCreateWithoutProblemInput[]
    connectOrCreate?: SheetProblemCreateOrConnectWithoutProblemInput | SheetProblemCreateOrConnectWithoutProblemInput[]
    createMany?: SheetProblemCreateManyProblemInputEnvelope
    connect?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ProblemsOnTopicTagsUpdateManyWithoutProblemNestedInput = {
    create?: XOR<ProblemsOnTopicTagsCreateWithoutProblemInput, ProblemsOnTopicTagsUncheckedCreateWithoutProblemInput> | ProblemsOnTopicTagsCreateWithoutProblemInput[] | ProblemsOnTopicTagsUncheckedCreateWithoutProblemInput[]
    connectOrCreate?: ProblemsOnTopicTagsCreateOrConnectWithoutProblemInput | ProblemsOnTopicTagsCreateOrConnectWithoutProblemInput[]
    upsert?: ProblemsOnTopicTagsUpsertWithWhereUniqueWithoutProblemInput | ProblemsOnTopicTagsUpsertWithWhereUniqueWithoutProblemInput[]
    createMany?: ProblemsOnTopicTagsCreateManyProblemInputEnvelope
    set?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    disconnect?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    delete?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    connect?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    update?: ProblemsOnTopicTagsUpdateWithWhereUniqueWithoutProblemInput | ProblemsOnTopicTagsUpdateWithWhereUniqueWithoutProblemInput[]
    updateMany?: ProblemsOnTopicTagsUpdateManyWithWhereWithoutProblemInput | ProblemsOnTopicTagsUpdateManyWithWhereWithoutProblemInput[]
    deleteMany?: ProblemsOnTopicTagsScalarWhereInput | ProblemsOnTopicTagsScalarWhereInput[]
  }

  export type SheetProblemUpdateManyWithoutProblemNestedInput = {
    create?: XOR<SheetProblemCreateWithoutProblemInput, SheetProblemUncheckedCreateWithoutProblemInput> | SheetProblemCreateWithoutProblemInput[] | SheetProblemUncheckedCreateWithoutProblemInput[]
    connectOrCreate?: SheetProblemCreateOrConnectWithoutProblemInput | SheetProblemCreateOrConnectWithoutProblemInput[]
    upsert?: SheetProblemUpsertWithWhereUniqueWithoutProblemInput | SheetProblemUpsertWithWhereUniqueWithoutProblemInput[]
    createMany?: SheetProblemCreateManyProblemInputEnvelope
    set?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    disconnect?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    delete?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    connect?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    update?: SheetProblemUpdateWithWhereUniqueWithoutProblemInput | SheetProblemUpdateWithWhereUniqueWithoutProblemInput[]
    updateMany?: SheetProblemUpdateManyWithWhereWithoutProblemInput | SheetProblemUpdateManyWithWhereWithoutProblemInput[]
    deleteMany?: SheetProblemScalarWhereInput | SheetProblemScalarWhereInput[]
  }

  export type ProblemsOnTopicTagsUncheckedUpdateManyWithoutProblemNestedInput = {
    create?: XOR<ProblemsOnTopicTagsCreateWithoutProblemInput, ProblemsOnTopicTagsUncheckedCreateWithoutProblemInput> | ProblemsOnTopicTagsCreateWithoutProblemInput[] | ProblemsOnTopicTagsUncheckedCreateWithoutProblemInput[]
    connectOrCreate?: ProblemsOnTopicTagsCreateOrConnectWithoutProblemInput | ProblemsOnTopicTagsCreateOrConnectWithoutProblemInput[]
    upsert?: ProblemsOnTopicTagsUpsertWithWhereUniqueWithoutProblemInput | ProblemsOnTopicTagsUpsertWithWhereUniqueWithoutProblemInput[]
    createMany?: ProblemsOnTopicTagsCreateManyProblemInputEnvelope
    set?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    disconnect?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    delete?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    connect?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    update?: ProblemsOnTopicTagsUpdateWithWhereUniqueWithoutProblemInput | ProblemsOnTopicTagsUpdateWithWhereUniqueWithoutProblemInput[]
    updateMany?: ProblemsOnTopicTagsUpdateManyWithWhereWithoutProblemInput | ProblemsOnTopicTagsUpdateManyWithWhereWithoutProblemInput[]
    deleteMany?: ProblemsOnTopicTagsScalarWhereInput | ProblemsOnTopicTagsScalarWhereInput[]
  }

  export type SheetProblemUncheckedUpdateManyWithoutProblemNestedInput = {
    create?: XOR<SheetProblemCreateWithoutProblemInput, SheetProblemUncheckedCreateWithoutProblemInput> | SheetProblemCreateWithoutProblemInput[] | SheetProblemUncheckedCreateWithoutProblemInput[]
    connectOrCreate?: SheetProblemCreateOrConnectWithoutProblemInput | SheetProblemCreateOrConnectWithoutProblemInput[]
    upsert?: SheetProblemUpsertWithWhereUniqueWithoutProblemInput | SheetProblemUpsertWithWhereUniqueWithoutProblemInput[]
    createMany?: SheetProblemCreateManyProblemInputEnvelope
    set?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    disconnect?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    delete?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    connect?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    update?: SheetProblemUpdateWithWhereUniqueWithoutProblemInput | SheetProblemUpdateWithWhereUniqueWithoutProblemInput[]
    updateMany?: SheetProblemUpdateManyWithWhereWithoutProblemInput | SheetProblemUpdateManyWithWhereWithoutProblemInput[]
    deleteMany?: SheetProblemScalarWhereInput | SheetProblemScalarWhereInput[]
  }

  export type ProblemsOnTopicTagsCreateNestedManyWithoutTopicTagInput = {
    create?: XOR<ProblemsOnTopicTagsCreateWithoutTopicTagInput, ProblemsOnTopicTagsUncheckedCreateWithoutTopicTagInput> | ProblemsOnTopicTagsCreateWithoutTopicTagInput[] | ProblemsOnTopicTagsUncheckedCreateWithoutTopicTagInput[]
    connectOrCreate?: ProblemsOnTopicTagsCreateOrConnectWithoutTopicTagInput | ProblemsOnTopicTagsCreateOrConnectWithoutTopicTagInput[]
    createMany?: ProblemsOnTopicTagsCreateManyTopicTagInputEnvelope
    connect?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
  }

  export type ProblemsOnTopicTagsUncheckedCreateNestedManyWithoutTopicTagInput = {
    create?: XOR<ProblemsOnTopicTagsCreateWithoutTopicTagInput, ProblemsOnTopicTagsUncheckedCreateWithoutTopicTagInput> | ProblemsOnTopicTagsCreateWithoutTopicTagInput[] | ProblemsOnTopicTagsUncheckedCreateWithoutTopicTagInput[]
    connectOrCreate?: ProblemsOnTopicTagsCreateOrConnectWithoutTopicTagInput | ProblemsOnTopicTagsCreateOrConnectWithoutTopicTagInput[]
    createMany?: ProblemsOnTopicTagsCreateManyTopicTagInputEnvelope
    connect?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
  }

  export type ProblemsOnTopicTagsUpdateManyWithoutTopicTagNestedInput = {
    create?: XOR<ProblemsOnTopicTagsCreateWithoutTopicTagInput, ProblemsOnTopicTagsUncheckedCreateWithoutTopicTagInput> | ProblemsOnTopicTagsCreateWithoutTopicTagInput[] | ProblemsOnTopicTagsUncheckedCreateWithoutTopicTagInput[]
    connectOrCreate?: ProblemsOnTopicTagsCreateOrConnectWithoutTopicTagInput | ProblemsOnTopicTagsCreateOrConnectWithoutTopicTagInput[]
    upsert?: ProblemsOnTopicTagsUpsertWithWhereUniqueWithoutTopicTagInput | ProblemsOnTopicTagsUpsertWithWhereUniqueWithoutTopicTagInput[]
    createMany?: ProblemsOnTopicTagsCreateManyTopicTagInputEnvelope
    set?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    disconnect?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    delete?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    connect?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    update?: ProblemsOnTopicTagsUpdateWithWhereUniqueWithoutTopicTagInput | ProblemsOnTopicTagsUpdateWithWhereUniqueWithoutTopicTagInput[]
    updateMany?: ProblemsOnTopicTagsUpdateManyWithWhereWithoutTopicTagInput | ProblemsOnTopicTagsUpdateManyWithWhereWithoutTopicTagInput[]
    deleteMany?: ProblemsOnTopicTagsScalarWhereInput | ProblemsOnTopicTagsScalarWhereInput[]
  }

  export type ProblemsOnTopicTagsUncheckedUpdateManyWithoutTopicTagNestedInput = {
    create?: XOR<ProblemsOnTopicTagsCreateWithoutTopicTagInput, ProblemsOnTopicTagsUncheckedCreateWithoutTopicTagInput> | ProblemsOnTopicTagsCreateWithoutTopicTagInput[] | ProblemsOnTopicTagsUncheckedCreateWithoutTopicTagInput[]
    connectOrCreate?: ProblemsOnTopicTagsCreateOrConnectWithoutTopicTagInput | ProblemsOnTopicTagsCreateOrConnectWithoutTopicTagInput[]
    upsert?: ProblemsOnTopicTagsUpsertWithWhereUniqueWithoutTopicTagInput | ProblemsOnTopicTagsUpsertWithWhereUniqueWithoutTopicTagInput[]
    createMany?: ProblemsOnTopicTagsCreateManyTopicTagInputEnvelope
    set?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    disconnect?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    delete?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    connect?: ProblemsOnTopicTagsWhereUniqueInput | ProblemsOnTopicTagsWhereUniqueInput[]
    update?: ProblemsOnTopicTagsUpdateWithWhereUniqueWithoutTopicTagInput | ProblemsOnTopicTagsUpdateWithWhereUniqueWithoutTopicTagInput[]
    updateMany?: ProblemsOnTopicTagsUpdateManyWithWhereWithoutTopicTagInput | ProblemsOnTopicTagsUpdateManyWithWhereWithoutTopicTagInput[]
    deleteMany?: ProblemsOnTopicTagsScalarWhereInput | ProblemsOnTopicTagsScalarWhereInput[]
  }

  export type ProblemCreateNestedOneWithoutTopicTagsInput = {
    create?: XOR<ProblemCreateWithoutTopicTagsInput, ProblemUncheckedCreateWithoutTopicTagsInput>
    connectOrCreate?: ProblemCreateOrConnectWithoutTopicTagsInput
    connect?: ProblemWhereUniqueInput
  }

  export type TopicTagCreateNestedOneWithoutProblemsInput = {
    create?: XOR<TopicTagCreateWithoutProblemsInput, TopicTagUncheckedCreateWithoutProblemsInput>
    connectOrCreate?: TopicTagCreateOrConnectWithoutProblemsInput
    connect?: TopicTagWhereUniqueInput
  }

  export type ProblemUpdateOneRequiredWithoutTopicTagsNestedInput = {
    create?: XOR<ProblemCreateWithoutTopicTagsInput, ProblemUncheckedCreateWithoutTopicTagsInput>
    connectOrCreate?: ProblemCreateOrConnectWithoutTopicTagsInput
    upsert?: ProblemUpsertWithoutTopicTagsInput
    connect?: ProblemWhereUniqueInput
    update?: XOR<XOR<ProblemUpdateToOneWithWhereWithoutTopicTagsInput, ProblemUpdateWithoutTopicTagsInput>, ProblemUncheckedUpdateWithoutTopicTagsInput>
  }

  export type TopicTagUpdateOneRequiredWithoutProblemsNestedInput = {
    create?: XOR<TopicTagCreateWithoutProblemsInput, TopicTagUncheckedCreateWithoutProblemsInput>
    connectOrCreate?: TopicTagCreateOrConnectWithoutProblemsInput
    upsert?: TopicTagUpsertWithoutProblemsInput
    connect?: TopicTagWhereUniqueInput
    update?: XOR<XOR<TopicTagUpdateToOneWithWhereWithoutProblemsInput, TopicTagUpdateWithoutProblemsInput>, TopicTagUncheckedUpdateWithoutProblemsInput>
  }

  export type ProblemCreateNestedOneWithoutSheetProblemInput = {
    create?: XOR<ProblemCreateWithoutSheetProblemInput, ProblemUncheckedCreateWithoutSheetProblemInput>
    connectOrCreate?: ProblemCreateOrConnectWithoutSheetProblemInput
    connect?: ProblemWhereUniqueInput
  }

  export type SheetCreateNestedOneWithoutSheetProblemInput = {
    create?: XOR<SheetCreateWithoutSheetProblemInput, SheetUncheckedCreateWithoutSheetProblemInput>
    connectOrCreate?: SheetCreateOrConnectWithoutSheetProblemInput
    connect?: SheetWhereUniqueInput
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type ProblemUpdateOneRequiredWithoutSheetProblemNestedInput = {
    create?: XOR<ProblemCreateWithoutSheetProblemInput, ProblemUncheckedCreateWithoutSheetProblemInput>
    connectOrCreate?: ProblemCreateOrConnectWithoutSheetProblemInput
    upsert?: ProblemUpsertWithoutSheetProblemInput
    connect?: ProblemWhereUniqueInput
    update?: XOR<XOR<ProblemUpdateToOneWithWhereWithoutSheetProblemInput, ProblemUpdateWithoutSheetProblemInput>, ProblemUncheckedUpdateWithoutSheetProblemInput>
  }

  export type SheetUpdateOneRequiredWithoutSheetProblemNestedInput = {
    create?: XOR<SheetCreateWithoutSheetProblemInput, SheetUncheckedCreateWithoutSheetProblemInput>
    connectOrCreate?: SheetCreateOrConnectWithoutSheetProblemInput
    upsert?: SheetUpsertWithoutSheetProblemInput
    connect?: SheetWhereUniqueInput
    update?: XOR<XOR<SheetUpdateToOneWithWhereWithoutSheetProblemInput, SheetUpdateWithoutSheetProblemInput>, SheetUncheckedUpdateWithoutSheetProblemInput>
  }

  export type SheetProblemCreateNestedManyWithoutSheetInput = {
    create?: XOR<SheetProblemCreateWithoutSheetInput, SheetProblemUncheckedCreateWithoutSheetInput> | SheetProblemCreateWithoutSheetInput[] | SheetProblemUncheckedCreateWithoutSheetInput[]
    connectOrCreate?: SheetProblemCreateOrConnectWithoutSheetInput | SheetProblemCreateOrConnectWithoutSheetInput[]
    createMany?: SheetProblemCreateManySheetInputEnvelope
    connect?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
  }

  export type SheetProblemUncheckedCreateNestedManyWithoutSheetInput = {
    create?: XOR<SheetProblemCreateWithoutSheetInput, SheetProblemUncheckedCreateWithoutSheetInput> | SheetProblemCreateWithoutSheetInput[] | SheetProblemUncheckedCreateWithoutSheetInput[]
    connectOrCreate?: SheetProblemCreateOrConnectWithoutSheetInput | SheetProblemCreateOrConnectWithoutSheetInput[]
    createMany?: SheetProblemCreateManySheetInputEnvelope
    connect?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
  }

  export type SheetProblemUpdateManyWithoutSheetNestedInput = {
    create?: XOR<SheetProblemCreateWithoutSheetInput, SheetProblemUncheckedCreateWithoutSheetInput> | SheetProblemCreateWithoutSheetInput[] | SheetProblemUncheckedCreateWithoutSheetInput[]
    connectOrCreate?: SheetProblemCreateOrConnectWithoutSheetInput | SheetProblemCreateOrConnectWithoutSheetInput[]
    upsert?: SheetProblemUpsertWithWhereUniqueWithoutSheetInput | SheetProblemUpsertWithWhereUniqueWithoutSheetInput[]
    createMany?: SheetProblemCreateManySheetInputEnvelope
    set?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    disconnect?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    delete?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    connect?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    update?: SheetProblemUpdateWithWhereUniqueWithoutSheetInput | SheetProblemUpdateWithWhereUniqueWithoutSheetInput[]
    updateMany?: SheetProblemUpdateManyWithWhereWithoutSheetInput | SheetProblemUpdateManyWithWhereWithoutSheetInput[]
    deleteMany?: SheetProblemScalarWhereInput | SheetProblemScalarWhereInput[]
  }

  export type SheetProblemUncheckedUpdateManyWithoutSheetNestedInput = {
    create?: XOR<SheetProblemCreateWithoutSheetInput, SheetProblemUncheckedCreateWithoutSheetInput> | SheetProblemCreateWithoutSheetInput[] | SheetProblemUncheckedCreateWithoutSheetInput[]
    connectOrCreate?: SheetProblemCreateOrConnectWithoutSheetInput | SheetProblemCreateOrConnectWithoutSheetInput[]
    upsert?: SheetProblemUpsertWithWhereUniqueWithoutSheetInput | SheetProblemUpsertWithWhereUniqueWithoutSheetInput[]
    createMany?: SheetProblemCreateManySheetInputEnvelope
    set?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    disconnect?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    delete?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    connect?: SheetProblemWhereUniqueInput | SheetProblemWhereUniqueInput[]
    update?: SheetProblemUpdateWithWhereUniqueWithoutSheetInput | SheetProblemUpdateWithWhereUniqueWithoutSheetInput[]
    updateMany?: SheetProblemUpdateManyWithWhereWithoutSheetInput | SheetProblemUpdateManyWithWhereWithoutSheetInput[]
    deleteMany?: SheetProblemScalarWhereInput | SheetProblemScalarWhereInput[]
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type ProblemsOnTopicTagsCreateWithoutProblemInput = {
    topicTag: TopicTagCreateNestedOneWithoutProblemsInput
  }

  export type ProblemsOnTopicTagsUncheckedCreateWithoutProblemInput = {
    topicTagId: number
  }

  export type ProblemsOnTopicTagsCreateOrConnectWithoutProblemInput = {
    where: ProblemsOnTopicTagsWhereUniqueInput
    create: XOR<ProblemsOnTopicTagsCreateWithoutProblemInput, ProblemsOnTopicTagsUncheckedCreateWithoutProblemInput>
  }

  export type ProblemsOnTopicTagsCreateManyProblemInputEnvelope = {
    data: ProblemsOnTopicTagsCreateManyProblemInput | ProblemsOnTopicTagsCreateManyProblemInput[]
    skipDuplicates?: boolean
  }

  export type SheetProblemCreateWithoutProblemInput = {
    sheetOrder?: Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: Decimal | DecimalJsLike | number | string
    yearlyOrder?: Decimal | DecimalJsLike | number | string
    sheet: SheetCreateNestedOneWithoutSheetProblemInput
  }

  export type SheetProblemUncheckedCreateWithoutProblemInput = {
    sheetId: number
    sheetOrder?: Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: Decimal | DecimalJsLike | number | string
    yearlyOrder?: Decimal | DecimalJsLike | number | string
  }

  export type SheetProblemCreateOrConnectWithoutProblemInput = {
    where: SheetProblemWhereUniqueInput
    create: XOR<SheetProblemCreateWithoutProblemInput, SheetProblemUncheckedCreateWithoutProblemInput>
  }

  export type SheetProblemCreateManyProblemInputEnvelope = {
    data: SheetProblemCreateManyProblemInput | SheetProblemCreateManyProblemInput[]
    skipDuplicates?: boolean
  }

  export type ProblemsOnTopicTagsUpsertWithWhereUniqueWithoutProblemInput = {
    where: ProblemsOnTopicTagsWhereUniqueInput
    update: XOR<ProblemsOnTopicTagsUpdateWithoutProblemInput, ProblemsOnTopicTagsUncheckedUpdateWithoutProblemInput>
    create: XOR<ProblemsOnTopicTagsCreateWithoutProblemInput, ProblemsOnTopicTagsUncheckedCreateWithoutProblemInput>
  }

  export type ProblemsOnTopicTagsUpdateWithWhereUniqueWithoutProblemInput = {
    where: ProblemsOnTopicTagsWhereUniqueInput
    data: XOR<ProblemsOnTopicTagsUpdateWithoutProblemInput, ProblemsOnTopicTagsUncheckedUpdateWithoutProblemInput>
  }

  export type ProblemsOnTopicTagsUpdateManyWithWhereWithoutProblemInput = {
    where: ProblemsOnTopicTagsScalarWhereInput
    data: XOR<ProblemsOnTopicTagsUpdateManyMutationInput, ProblemsOnTopicTagsUncheckedUpdateManyWithoutProblemInput>
  }

  export type ProblemsOnTopicTagsScalarWhereInput = {
    AND?: ProblemsOnTopicTagsScalarWhereInput | ProblemsOnTopicTagsScalarWhereInput[]
    OR?: ProblemsOnTopicTagsScalarWhereInput[]
    NOT?: ProblemsOnTopicTagsScalarWhereInput | ProblemsOnTopicTagsScalarWhereInput[]
    problemId?: IntFilter<"ProblemsOnTopicTags"> | number
    topicTagId?: IntFilter<"ProblemsOnTopicTags"> | number
  }

  export type SheetProblemUpsertWithWhereUniqueWithoutProblemInput = {
    where: SheetProblemWhereUniqueInput
    update: XOR<SheetProblemUpdateWithoutProblemInput, SheetProblemUncheckedUpdateWithoutProblemInput>
    create: XOR<SheetProblemCreateWithoutProblemInput, SheetProblemUncheckedCreateWithoutProblemInput>
  }

  export type SheetProblemUpdateWithWhereUniqueWithoutProblemInput = {
    where: SheetProblemWhereUniqueInput
    data: XOR<SheetProblemUpdateWithoutProblemInput, SheetProblemUncheckedUpdateWithoutProblemInput>
  }

  export type SheetProblemUpdateManyWithWhereWithoutProblemInput = {
    where: SheetProblemScalarWhereInput
    data: XOR<SheetProblemUpdateManyMutationInput, SheetProblemUncheckedUpdateManyWithoutProblemInput>
  }

  export type SheetProblemScalarWhereInput = {
    AND?: SheetProblemScalarWhereInput | SheetProblemScalarWhereInput[]
    OR?: SheetProblemScalarWhereInput[]
    NOT?: SheetProblemScalarWhereInput | SheetProblemScalarWhereInput[]
    problemId?: IntFilter<"SheetProblem"> | number
    sheetId?: IntFilter<"SheetProblem"> | number
    sheetOrder?: DecimalFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: DecimalFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: DecimalFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: DecimalFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
    yearlyOrder?: DecimalFilter<"SheetProblem"> | Decimal | DecimalJsLike | number | string
  }

  export type ProblemsOnTopicTagsCreateWithoutTopicTagInput = {
    problem: ProblemCreateNestedOneWithoutTopicTagsInput
  }

  export type ProblemsOnTopicTagsUncheckedCreateWithoutTopicTagInput = {
    problemId: number
  }

  export type ProblemsOnTopicTagsCreateOrConnectWithoutTopicTagInput = {
    where: ProblemsOnTopicTagsWhereUniqueInput
    create: XOR<ProblemsOnTopicTagsCreateWithoutTopicTagInput, ProblemsOnTopicTagsUncheckedCreateWithoutTopicTagInput>
  }

  export type ProblemsOnTopicTagsCreateManyTopicTagInputEnvelope = {
    data: ProblemsOnTopicTagsCreateManyTopicTagInput | ProblemsOnTopicTagsCreateManyTopicTagInput[]
    skipDuplicates?: boolean
  }

  export type ProblemsOnTopicTagsUpsertWithWhereUniqueWithoutTopicTagInput = {
    where: ProblemsOnTopicTagsWhereUniqueInput
    update: XOR<ProblemsOnTopicTagsUpdateWithoutTopicTagInput, ProblemsOnTopicTagsUncheckedUpdateWithoutTopicTagInput>
    create: XOR<ProblemsOnTopicTagsCreateWithoutTopicTagInput, ProblemsOnTopicTagsUncheckedCreateWithoutTopicTagInput>
  }

  export type ProblemsOnTopicTagsUpdateWithWhereUniqueWithoutTopicTagInput = {
    where: ProblemsOnTopicTagsWhereUniqueInput
    data: XOR<ProblemsOnTopicTagsUpdateWithoutTopicTagInput, ProblemsOnTopicTagsUncheckedUpdateWithoutTopicTagInput>
  }

  export type ProblemsOnTopicTagsUpdateManyWithWhereWithoutTopicTagInput = {
    where: ProblemsOnTopicTagsScalarWhereInput
    data: XOR<ProblemsOnTopicTagsUpdateManyMutationInput, ProblemsOnTopicTagsUncheckedUpdateManyWithoutTopicTagInput>
  }

  export type ProblemCreateWithoutTopicTagsInput = {
    title: string
    url: string
    difficulty: string
    difficultyOrder?: number
    acceptance?: number
    isPaid: boolean
    SheetProblem?: SheetProblemCreateNestedManyWithoutProblemInput
  }

  export type ProblemUncheckedCreateWithoutTopicTagsInput = {
    id?: number
    title: string
    url: string
    difficulty: string
    difficultyOrder?: number
    acceptance?: number
    isPaid: boolean
    SheetProblem?: SheetProblemUncheckedCreateNestedManyWithoutProblemInput
  }

  export type ProblemCreateOrConnectWithoutTopicTagsInput = {
    where: ProblemWhereUniqueInput
    create: XOR<ProblemCreateWithoutTopicTagsInput, ProblemUncheckedCreateWithoutTopicTagsInput>
  }

  export type TopicTagCreateWithoutProblemsInput = {
    slug: string
    name: string
  }

  export type TopicTagUncheckedCreateWithoutProblemsInput = {
    id?: number
    slug: string
    name: string
  }

  export type TopicTagCreateOrConnectWithoutProblemsInput = {
    where: TopicTagWhereUniqueInput
    create: XOR<TopicTagCreateWithoutProblemsInput, TopicTagUncheckedCreateWithoutProblemsInput>
  }

  export type ProblemUpsertWithoutTopicTagsInput = {
    update: XOR<ProblemUpdateWithoutTopicTagsInput, ProblemUncheckedUpdateWithoutTopicTagsInput>
    create: XOR<ProblemCreateWithoutTopicTagsInput, ProblemUncheckedCreateWithoutTopicTagsInput>
    where?: ProblemWhereInput
  }

  export type ProblemUpdateToOneWithWhereWithoutTopicTagsInput = {
    where?: ProblemWhereInput
    data: XOR<ProblemUpdateWithoutTopicTagsInput, ProblemUncheckedUpdateWithoutTopicTagsInput>
  }

  export type ProblemUpdateWithoutTopicTagsInput = {
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    difficultyOrder?: IntFieldUpdateOperationsInput | number
    acceptance?: IntFieldUpdateOperationsInput | number
    isPaid?: BoolFieldUpdateOperationsInput | boolean
    SheetProblem?: SheetProblemUpdateManyWithoutProblemNestedInput
  }

  export type ProblemUncheckedUpdateWithoutTopicTagsInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    difficultyOrder?: IntFieldUpdateOperationsInput | number
    acceptance?: IntFieldUpdateOperationsInput | number
    isPaid?: BoolFieldUpdateOperationsInput | boolean
    SheetProblem?: SheetProblemUncheckedUpdateManyWithoutProblemNestedInput
  }

  export type TopicTagUpsertWithoutProblemsInput = {
    update: XOR<TopicTagUpdateWithoutProblemsInput, TopicTagUncheckedUpdateWithoutProblemsInput>
    create: XOR<TopicTagCreateWithoutProblemsInput, TopicTagUncheckedCreateWithoutProblemsInput>
    where?: TopicTagWhereInput
  }

  export type TopicTagUpdateToOneWithWhereWithoutProblemsInput = {
    where?: TopicTagWhereInput
    data: XOR<TopicTagUpdateWithoutProblemsInput, TopicTagUncheckedUpdateWithoutProblemsInput>
  }

  export type TopicTagUpdateWithoutProblemsInput = {
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type TopicTagUncheckedUpdateWithoutProblemsInput = {
    id?: IntFieldUpdateOperationsInput | number
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type ProblemCreateWithoutSheetProblemInput = {
    title: string
    url: string
    difficulty: string
    difficultyOrder?: number
    acceptance?: number
    isPaid: boolean
    topicTags?: ProblemsOnTopicTagsCreateNestedManyWithoutProblemInput
  }

  export type ProblemUncheckedCreateWithoutSheetProblemInput = {
    id?: number
    title: string
    url: string
    difficulty: string
    difficultyOrder?: number
    acceptance?: number
    isPaid: boolean
    topicTags?: ProblemsOnTopicTagsUncheckedCreateNestedManyWithoutProblemInput
  }

  export type ProblemCreateOrConnectWithoutSheetProblemInput = {
    where: ProblemWhereUniqueInput
    create: XOR<ProblemCreateWithoutSheetProblemInput, ProblemUncheckedCreateWithoutSheetProblemInput>
  }

  export type SheetCreateWithoutSheetProblemInput = {
    slug: string
    name: string
    website?: string
    isCompany?: boolean
  }

  export type SheetUncheckedCreateWithoutSheetProblemInput = {
    id?: number
    slug: string
    name: string
    website?: string
    isCompany?: boolean
  }

  export type SheetCreateOrConnectWithoutSheetProblemInput = {
    where: SheetWhereUniqueInput
    create: XOR<SheetCreateWithoutSheetProblemInput, SheetUncheckedCreateWithoutSheetProblemInput>
  }

  export type ProblemUpsertWithoutSheetProblemInput = {
    update: XOR<ProblemUpdateWithoutSheetProblemInput, ProblemUncheckedUpdateWithoutSheetProblemInput>
    create: XOR<ProblemCreateWithoutSheetProblemInput, ProblemUncheckedCreateWithoutSheetProblemInput>
    where?: ProblemWhereInput
  }

  export type ProblemUpdateToOneWithWhereWithoutSheetProblemInput = {
    where?: ProblemWhereInput
    data: XOR<ProblemUpdateWithoutSheetProblemInput, ProblemUncheckedUpdateWithoutSheetProblemInput>
  }

  export type ProblemUpdateWithoutSheetProblemInput = {
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    difficultyOrder?: IntFieldUpdateOperationsInput | number
    acceptance?: IntFieldUpdateOperationsInput | number
    isPaid?: BoolFieldUpdateOperationsInput | boolean
    topicTags?: ProblemsOnTopicTagsUpdateManyWithoutProblemNestedInput
  }

  export type ProblemUncheckedUpdateWithoutSheetProblemInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    difficulty?: StringFieldUpdateOperationsInput | string
    difficultyOrder?: IntFieldUpdateOperationsInput | number
    acceptance?: IntFieldUpdateOperationsInput | number
    isPaid?: BoolFieldUpdateOperationsInput | boolean
    topicTags?: ProblemsOnTopicTagsUncheckedUpdateManyWithoutProblemNestedInput
  }

  export type SheetUpsertWithoutSheetProblemInput = {
    update: XOR<SheetUpdateWithoutSheetProblemInput, SheetUncheckedUpdateWithoutSheetProblemInput>
    create: XOR<SheetCreateWithoutSheetProblemInput, SheetUncheckedCreateWithoutSheetProblemInput>
    where?: SheetWhereInput
  }

  export type SheetUpdateToOneWithWhereWithoutSheetProblemInput = {
    where?: SheetWhereInput
    data: XOR<SheetUpdateWithoutSheetProblemInput, SheetUncheckedUpdateWithoutSheetProblemInput>
  }

  export type SheetUpdateWithoutSheetProblemInput = {
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    isCompany?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SheetUncheckedUpdateWithoutSheetProblemInput = {
    id?: IntFieldUpdateOperationsInput | number
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    isCompany?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SheetProblemCreateWithoutSheetInput = {
    sheetOrder?: Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: Decimal | DecimalJsLike | number | string
    yearlyOrder?: Decimal | DecimalJsLike | number | string
    problem: ProblemCreateNestedOneWithoutSheetProblemInput
  }

  export type SheetProblemUncheckedCreateWithoutSheetInput = {
    problemId: number
    sheetOrder?: Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: Decimal | DecimalJsLike | number | string
    yearlyOrder?: Decimal | DecimalJsLike | number | string
  }

  export type SheetProblemCreateOrConnectWithoutSheetInput = {
    where: SheetProblemWhereUniqueInput
    create: XOR<SheetProblemCreateWithoutSheetInput, SheetProblemUncheckedCreateWithoutSheetInput>
  }

  export type SheetProblemCreateManySheetInputEnvelope = {
    data: SheetProblemCreateManySheetInput | SheetProblemCreateManySheetInput[]
    skipDuplicates?: boolean
  }

  export type SheetProblemUpsertWithWhereUniqueWithoutSheetInput = {
    where: SheetProblemWhereUniqueInput
    update: XOR<SheetProblemUpdateWithoutSheetInput, SheetProblemUncheckedUpdateWithoutSheetInput>
    create: XOR<SheetProblemCreateWithoutSheetInput, SheetProblemUncheckedCreateWithoutSheetInput>
  }

  export type SheetProblemUpdateWithWhereUniqueWithoutSheetInput = {
    where: SheetProblemWhereUniqueInput
    data: XOR<SheetProblemUpdateWithoutSheetInput, SheetProblemUncheckedUpdateWithoutSheetInput>
  }

  export type SheetProblemUpdateManyWithWhereWithoutSheetInput = {
    where: SheetProblemScalarWhereInput
    data: XOR<SheetProblemUpdateManyMutationInput, SheetProblemUncheckedUpdateManyWithoutSheetInput>
  }

  export type ProblemsOnTopicTagsCreateManyProblemInput = {
    topicTagId: number
  }

  export type SheetProblemCreateManyProblemInput = {
    sheetId: number
    sheetOrder?: Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: Decimal | DecimalJsLike | number | string
    yearlyOrder?: Decimal | DecimalJsLike | number | string
  }

  export type ProblemsOnTopicTagsUpdateWithoutProblemInput = {
    topicTag?: TopicTagUpdateOneRequiredWithoutProblemsNestedInput
  }

  export type ProblemsOnTopicTagsUncheckedUpdateWithoutProblemInput = {
    topicTagId?: IntFieldUpdateOperationsInput | number
  }

  export type ProblemsOnTopicTagsUncheckedUpdateManyWithoutProblemInput = {
    topicTagId?: IntFieldUpdateOperationsInput | number
  }

  export type SheetProblemUpdateWithoutProblemInput = {
    sheetOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    yearlyOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    sheet?: SheetUpdateOneRequiredWithoutSheetProblemNestedInput
  }

  export type SheetProblemUncheckedUpdateWithoutProblemInput = {
    sheetId?: IntFieldUpdateOperationsInput | number
    sheetOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    yearlyOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type SheetProblemUncheckedUpdateManyWithoutProblemInput = {
    sheetId?: IntFieldUpdateOperationsInput | number
    sheetOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    yearlyOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type ProblemsOnTopicTagsCreateManyTopicTagInput = {
    problemId: number
  }

  export type ProblemsOnTopicTagsUpdateWithoutTopicTagInput = {
    problem?: ProblemUpdateOneRequiredWithoutTopicTagsNestedInput
  }

  export type ProblemsOnTopicTagsUncheckedUpdateWithoutTopicTagInput = {
    problemId?: IntFieldUpdateOperationsInput | number
  }

  export type ProblemsOnTopicTagsUncheckedUpdateManyWithoutTopicTagInput = {
    problemId?: IntFieldUpdateOperationsInput | number
  }

  export type SheetProblemCreateManySheetInput = {
    problemId: number
    sheetOrder?: Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: Decimal | DecimalJsLike | number | string
    yearlyOrder?: Decimal | DecimalJsLike | number | string
  }

  export type SheetProblemUpdateWithoutSheetInput = {
    sheetOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    yearlyOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    problem?: ProblemUpdateOneRequiredWithoutSheetProblemNestedInput
  }

  export type SheetProblemUncheckedUpdateWithoutSheetInput = {
    problemId?: IntFieldUpdateOperationsInput | number
    sheetOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    yearlyOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }

  export type SheetProblemUncheckedUpdateManyWithoutSheetInput = {
    problemId?: IntFieldUpdateOperationsInput | number
    sheetOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thirtyDaysOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    threeMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    sixMonthsOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    yearlyOrder?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}