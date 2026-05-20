#define NAPI_EXPERIMENTAL
#include <node_api.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <limits.h>

#define BIT_MASK(n) (~( ((~0ull) << ((n)-1)) << 1 ))

// The maximum size we'll store on the stack. If we need a larger temporary
// buffer malloc will be called.
#define BUFFER_STACK_SIZE 32

#if defined(_WIN16) || defined(_WIN32) || defined(_WIN64)
#define bswap64(x) _byteswap_uint64(x)
#else
#define bswap64(x) __builtin_bswap64(x)
#endif

// Throw a JS error and return NULL. Used in place of bare `assert(status == napi_ok)`
// because asserts compile out under NDEBUG, leaving release builds with no
// error handling at all (CWE-617 Reachable Assertion / CWE-754 Improper Check
// for Unusual or Exceptional Conditions).
#define NAPI_CHECK(env, status, msg)                                   \
  do {                                                                  \
    if ((status) != napi_ok) {                                          \
      napi_throw_error((env), NULL, (msg));                             \
      return NULL;                                                       \
    }                                                                    \
  } while (0)

#define NAPI_CHECK_FREE(env, status, msg, ptr)                          \
  do {                                                                   \
    if ((status) != napi_ok) {                                           \
      free(ptr);                                                          \
      napi_throw_error((env), NULL, (msg));                              \
      return NULL;                                                        \
    }                                                                     \
  } while (0)

/**
 * Converts a Buffer to bigint.
 * node param 0: buffer
 * node param 1: big_endian (optional boolean, default false)
 *
 * returns bigint
 */
napi_value toBigInt(napi_env env, napi_callback_info info) {
  napi_value argv[2];
  napi_status status;
  size_t argc = 2;

  status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
  NAPI_CHECK(env, status, "toBigInt: napi_get_cb_info failed");

  if (argc < 1) {
    napi_throw_error(env, "EINVAL", "toBigInt: missing buffer argument");
    return NULL;
  }

  // Validate that argv[0] is actually a Buffer/Uint8Array view.
  bool is_buffer = false;
  status = napi_is_buffer(env, argv[0], &is_buffer);
  NAPI_CHECK(env, status, "toBigInt: napi_is_buffer failed");
  if (!is_buffer) {
    napi_throw_type_error(env, "EINVAL", "toBigInt: first argument must be a Buffer");
    return NULL;
  }

  bool big_endian = false;
  if (argc >= 2) {
    // napi_get_cb_info guarantees argv[1] is at minimum a napi_value
    // representing undefined when not passed, so this is well-defined.
    status = napi_get_value_bool(env, argv[1], &big_endian);
    if (status != napi_ok) {
      big_endian = false; // tolerate non-bool by defaulting to little-endian
    }
  }

  uint8_t* buffer = NULL;
  size_t len = 0;
  status = napi_get_buffer_info(env, argv[0], (void**)&buffer, &len);
  NAPI_CHECK(env, status, "toBigInt: napi_get_buffer_info failed");

  // Empty buffer => 0n.
  if (len == 0) {
    napi_value zero;
    status = napi_create_bigint_int64(env, 0, &zero);
    NAPI_CHECK(env, status, "toBigInt: napi_create_bigint_int64 failed");
    return zero;
  }

  bool not_64_aligned = (len & 7) != 0;
  size_t overflow_len = not_64_aligned ? 8 - (len & 0x7) : 0;
  size_t aligned_len = len + overflow_len;
  size_t len_in_words = not_64_aligned ? (len >> 3) + 1 : (len >> 3);
  bool fits_in_stack = aligned_len <= BUFFER_STACK_SIZE;

  uint8_t copy[BUFFER_STACK_SIZE];
  uint8_t* bufTemp = NULL;
  if (fits_in_stack) {
    bufTemp = copy;
  } else {
    bufTemp = (uint8_t*)malloc(aligned_len);
    if (bufTemp == NULL) {
      napi_throw_error(env, "ENOMEM", "toBigInt: allocation failed");
      return NULL;
    }
  }

  if (overflow_len > 0) {
    memset(bufTemp + len, 0, overflow_len);
  }
  memcpy(bufTemp, buffer, len);
  uint64_t* as_64_aligned = (uint64_t*)bufTemp;
  size_t overflow_in_bits = overflow_len << 3;

  napi_value out;
  if (big_endian) {
    if (len_in_words == 1) {
      as_64_aligned[0] = not_64_aligned
                             ? bswap64(as_64_aligned[0]) >> overflow_in_bits
                             : bswap64(as_64_aligned[0]);
    } else {
      uint64_t temp;
      size_t last_word = len_in_words - 1;
      size_t end_ptr = last_word;
      int32_t offset;
      for (offset = 0; offset < (int32_t)(len_in_words / 2); offset++) {
        temp = as_64_aligned[offset];
        as_64_aligned[offset] = as_64_aligned[end_ptr];
        as_64_aligned[end_ptr] = temp;
        end_ptr--;
      }
      uint64_t prev_overflow = 0;
      for (offset = (int32_t)last_word; offset >= 0; offset--) {
        uint64_t as_little_endian = bswap64(as_64_aligned[offset]);
        uint64_t overflow = as_little_endian & BIT_MASK(overflow_in_bits);
        as_64_aligned[offset] = not_64_aligned
                                    ? (as_little_endian >> overflow_in_bits) | prev_overflow
                                    : as_little_endian;
        prev_overflow = overflow << (64 - overflow_in_bits);
      }
    }
  }

  status = napi_create_bigint_words(env, 0, len_in_words, as_64_aligned, &out);
  if (status != napi_ok) {
    if (!fits_in_stack) free(bufTemp);
    napi_throw_error(env, NULL, "toBigInt: napi_create_bigint_words failed");
    return NULL;
  }

  if (!fits_in_stack) {
    free(bufTemp);
  }
  return out;
}

/**
 * Converts a BigInt to a Buffer.
 * node param 0: BigInt
 * node param 1: buffer
 * node param 2: big_endian (optional boolean, default false)
 *
 * returns the input buffer (with bytes written in place)
 */
napi_value fromBigInt(napi_env env, napi_callback_info info) {
  napi_value argv[3];
  napi_status status;
  size_t argc = 3;

  status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
  NAPI_CHECK(env, status, "fromBigInt: napi_get_cb_info failed");

  if (argc < 2) {
    napi_throw_error(env, "EINVAL", "fromBigInt: requires bigint and buffer arguments");
    return NULL;
  }

  // Validate argv[0] is a bigint.
  napi_valuetype t0;
  status = napi_typeof(env, argv[0], &t0);
  NAPI_CHECK(env, status, "fromBigInt: napi_typeof failed");
  if (t0 != napi_bigint) {
    napi_throw_type_error(env, "EINVAL", "fromBigInt: first argument must be a bigint");
    return NULL;
  }

  // Validate argv[1] is a Buffer.
  bool is_buffer = false;
  status = napi_is_buffer(env, argv[1], &is_buffer);
  NAPI_CHECK(env, status, "fromBigInt: napi_is_buffer failed");
  if (!is_buffer) {
    napi_throw_type_error(env, "EINVAL", "fromBigInt: second argument must be a Buffer");
    return NULL;
  }

  bool big_endian = false;
  if (argc >= 3) {
    status = napi_get_value_bool(env, argv[2], &big_endian);
    if (status != napi_ok) {
      big_endian = false;
    }
  }

  size_t word_count = 0;
  status = napi_get_value_bigint_words(env, argv[0], NULL, &word_count, NULL);
  NAPI_CHECK(env, status, "fromBigInt: napi_get_value_bigint_words (size query) failed");

  uint8_t* raw_buffer = NULL;
  size_t byte_width = 0;
  status = napi_get_buffer_info(env, argv[1], (void**)&raw_buffer, &byte_width);
  NAPI_CHECK(env, status, "fromBigInt: napi_get_buffer_info failed");

  if (word_count == 0 || byte_width == 0) {
    if (byte_width > 0) memset(raw_buffer, 0, byte_width);
    return argv[1];
  }

  int sign_bit = 0;

  bool not_64_aligned = (byte_width & 7) != 0;
  size_t overflow_len = not_64_aligned ? 8 - (byte_width & 0x7) : 0;
  size_t word_width = (byte_width >> 3) + (not_64_aligned ? 1 : 0);
  size_t original_word_width = word_width;
  if (word_count > word_width) {
    word_count = word_width; // silent truncation matches JS toBufferBE semantics
  }
  size_t word_width_bytes = (word_count << 3);
  bool fits_in_stack = word_width_bytes <= BUFFER_STACK_SIZE;

  uint64_t* conv_buffer = (uint64_t*)raw_buffer;
  uint64_t stack_buffer[BUFFER_STACK_SIZE];
  bool allocated = false;
  if (not_64_aligned) {
    if (fits_in_stack) {
      conv_buffer = stack_buffer;
    } else {
      conv_buffer = (uint64_t*)malloc(byte_width + overflow_len);
      if (conv_buffer == NULL) {
        napi_throw_error(env, "ENOMEM", "fromBigInt: allocation failed");
        return NULL;
      }
      allocated = true;
    }
  }

  memset(conv_buffer, 0, byte_width + overflow_len);
  status = napi_get_value_bigint_words(env, argv[0], &sign_bit, &word_count, conv_buffer);
  if (status != napi_ok) {
    if (allocated) free(conv_buffer);
    napi_throw_error(env, NULL, "fromBigInt: napi_get_value_bigint_words failed");
    return NULL;
  }

  if (big_endian) {
    uint64_t temp;
    size_t conv_words = original_word_width;
    size_t last_word = conv_words - 1;
    size_t end_ptr = last_word;
    int32_t offset;
    for (offset = 0; offset < (int32_t)(conv_words / 2); offset++) {
      temp = bswap64(conv_buffer[offset]);
      conv_buffer[offset] = bswap64(conv_buffer[end_ptr]);
      conv_buffer[end_ptr] = temp;
      end_ptr--;
    }
    if (conv_words & 1) {
      conv_buffer[conv_words / 2] = bswap64(conv_buffer[conv_words / 2]);
    }
  }
  if (not_64_aligned) {
    memcpy(raw_buffer,
           big_endian ? (uint64_t*)(((uint8_t*)conv_buffer) + (8 - (byte_width & 7)))
                      : conv_buffer,
           byte_width);
    if (allocated) {
      free(conv_buffer);
    }
  }
  return argv[1];
}

napi_value init_all(napi_env env, napi_value exports) {
  napi_value bigint_fn = NULL;
  napi_value frombigint_fn = NULL;
  napi_status status;

  status = napi_create_function(env, NULL, 0, toBigInt, NULL, &bigint_fn);
  NAPI_CHECK(env, status, "init: failed to create toBigInt");
  status = napi_create_function(env, NULL, 0, fromBigInt, NULL, &frombigint_fn);
  NAPI_CHECK(env, status, "init: failed to create fromBigInt");

  status = napi_set_named_property(env, exports, "toBigInt", bigint_fn);
  NAPI_CHECK(env, status, "init: failed to attach toBigInt");
  status = napi_set_named_property(env, exports, "fromBigInt", frombigint_fn);
  NAPI_CHECK(env, status, "init: failed to attach fromBigInt");

  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init_all);
