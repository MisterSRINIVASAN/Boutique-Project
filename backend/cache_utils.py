import hashlib


def query_key_builder(
    func,
    namespace: str = "",
    *,
    request=None,
    response=None,
    args=(),
    kwargs=None,
):
    """Build a cache key from an endpoint's real query inputs only.

    fastapi-cache's default builder stringifies every kwarg, which includes the
    SQLAlchemy Session injected by Depends(get_db). A Session has no __repr__,
    so its default "<... object at 0x...>" lands in the key and changes on every
    request -- the cache writes a new entry each time and never reads one back.
    Dropping the non-serializable dependency args makes the key depend only on
    the values that actually change the response.
    """
    kwargs = kwargs or {}
    relevant = {
        k: v
        for k, v in sorted(kwargs.items())
        if isinstance(v, (str, int, float, bool, type(None)))
    }
    raw = f"{func.__module__}:{func.__name__}:{args}:{relevant}"
    return f"{namespace}:{hashlib.md5(raw.encode()).hexdigest()}"
