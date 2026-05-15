extern void js_log(const char *message, int length);

#define JS_LOG(literal) js_log(literal, sizeof(literal) - 1)
