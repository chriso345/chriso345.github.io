#ifndef ARENA_H
#define ARENA_H

#include <stdint.h>

typedef struct {
  void *memory;
  uintptr_t offset;
} Arena;

extern Arena frameArena;

#endif // ARENA_H
