"""Tests: /api/users gibt nur den eigenen Account preis, nie fremde Accounts."""


def _register(client, email, name="Test User", password="correct-horse-battery-9"):
    response = client.post(
        "/api/auth/register",
        json={"name": name, "email": email, "password": password, "password_confirm": password},
    )
    assert response.status_code == 201
    return response.json()


def test_list_users_only_returns_self(client):
    alice = _register(client, "alice@example.com")
    client.cookies.clear()
    _register(client, "bob@example.com", name="Bob")

    response = client.get("/api/users/")

    assert response.status_code == 200
    emails = [u["email"] for u in response.json()]
    assert emails == ["bob@example.com"]
    assert alice["email"] not in emails


def test_cannot_read_another_users_profile_by_id(client):
    alice = _register(client, "alice@example.com")
    client.cookies.clear()
    _register(client, "bob@example.com", name="Bob")

    response = client.get(f"/api/users/{alice['id']}")

    assert response.status_code == 404


def test_can_read_own_profile_by_id(client):
    alice = _register(client, "alice@example.com")

    response = client.get(f"/api/users/{alice['id']}")

    assert response.status_code == 200
    assert response.json()["email"] == "alice@example.com"


def test_cannot_update_another_users_profile(client):
    alice = _register(client, "alice@example.com")
    client.cookies.clear()
    _register(client, "bob@example.com", name="Bob")

    response = client.put(f"/api/users/{alice['id']}", json={"name": "Gehackt"})

    assert response.status_code == 404


def test_cannot_delete_another_users_profile(client):
    alice = _register(client, "alice@example.com")
    client.cookies.clear()
    _register(client, "bob@example.com", name="Bob")

    response = client.delete(f"/api/users/{alice['id']}")

    assert response.status_code == 404


def test_users_endpoints_require_auth(client):
    response = client.get("/api/users/")
    assert response.status_code == 401


def test_register_endpoint_still_creates_users_but_users_post_route_is_gone(client):
    # POST /api/users/ existierte frueher als Zweit-Weg, Accounts anzulegen --
    # jetzt gibt es nur noch POST /api/auth/register.
    response = client.post(
        "/api/users/", json={"username": "x", "name": "X", "email": "x@example.com"}
    )
    assert response.status_code == 405
