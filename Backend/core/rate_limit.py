"""Gemeinsame slowapi-Limiter-Instanz (von main.py und den Routern genutzt)."""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
