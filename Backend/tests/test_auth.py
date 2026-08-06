"""Tests für Registrierung, Login, Logout, geschützte Routes und Passwort-Änderung."""

from database import SessionLocal
from models.user import User

VALID_PASSWORD = "correct-horse-battery-9"
GENERIC_LOGIN_ERROR = "E-Mail oder Passwort ist falsch."


def _register(client, email="alice@example.com", password=VALID_PASSWORD, name="Alice Beispiel"):
    return client.post(
        "/api/auth/register",
        json={"name": name, "email": email, "password": password, "password_confirm": password},
    )


def test_register_with_valid_data_creates_hashed_password(client):
    response = _register(client)

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "alice@example.com"
    assert "password" not in body
    assert "password_hash" not in body

    with SessionLocal() as db:
        user = db.query(User).filter(User.email == "alice@example.com").first()
        assert user is not None
        assert user.password_hash != VALID_PASSWORD
        assert user.password_hash.startswith("$2b$")


def test_login_immediately_after_registration_succeeds(client):
    _register(client)
    client.cookies.clear()  # neuer "Tab" ohne bestehende Session

    response = client.post(
        "/api/auth/login", json={"email": "alice@example.com", "password": VALID_PASSWORD}
    )

    assert response.status_code == 200
    assert response.json()["email"] == "alice@example.com"


def test_register_with_existing_email_returns_409(client):
    _register(client)

    response = _register(client, name="Zweite Alice")

    assert response.status_code == 409


def test_register_with_invalid_email_returns_400(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Bob",
            "email": "not-an-email",
            "password": VALID_PASSWORD,
            "password_confirm": VALID_PASSWORD,
        },
    )

    assert response.status_code == 400


def test_register_with_short_password_returns_400(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Bob",
            "email": "bob@example.com",
            "password": "short1",
            "password_confirm": "short1",
        },
    )

    assert response.status_code == 400


def test_login_with_correct_credentials_sets_auth_cookies(client):
    _register(client)
    client.cookies.clear()

    response = client.post(
        "/api/auth/login", json={"email": "alice@example.com", "password": VALID_PASSWORD}
    )

    assert response.status_code == 200
    assert response.cookies.get("access_token") is not None
    assert response.cookies.get("refresh_token") is not None


def test_login_with_wrong_password_returns_generic_401(client):
    _register(client)
    client.cookies.clear()

    response = client.post(
        "/api/auth/login", json={"email": "alice@example.com", "password": "totally-wrong-1"}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == GENERIC_LOGIN_ERROR


def test_login_with_unknown_email_returns_identical_401(client):
    response = client.post(
        "/api/auth/login", json={"email": "nobody@example.com", "password": VALID_PASSWORD}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == GENERIC_LOGIN_ERROR


def test_protected_endpoint_without_auth_returns_401(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_protected_endpoint_with_auth_returns_200(client):
    _register(client)

    response = client.get("/api/auth/me")

    assert response.status_code == 200
    assert response.json()["email"] == "alice@example.com"


def test_change_password_with_correct_current_password_succeeds(client):
    _register(client)

    response = client.post(
        "/api/auth/change-password",
        json={
            "current_password": VALID_PASSWORD,
            "new_password": "another-strong-pass-2",
            "new_password_confirm": "another-strong-pass-2",
        },
    )
    assert response.status_code == 200

    client.cookies.clear()
    login_response = client.post(
        "/api/auth/login",
        json={"email": "alice@example.com", "password": "another-strong-pass-2"},
    )
    assert login_response.status_code == 200


def test_change_password_with_wrong_current_password_returns_401(client):
    _register(client)

    response = client.post(
        "/api/auth/change-password",
        json={
            "current_password": "not-the-real-password",
            "new_password": "another-strong-pass-2",
            "new_password_confirm": "another-strong-pass-2",
        },
    )

    assert response.status_code == 401


def test_logout_invalidates_refresh_token(client):
    _register(client)
    refresh_token = client.cookies.get("refresh_token")
    assert refresh_token

    logout_response = client.post("/api/auth/logout")
    assert logout_response.status_code == 200

    # Der alte (bereits invalidierte) Refresh-Token darf nicht mehr funktionieren,
    # selbst wenn er manuell erneut mitgeschickt wird.
    client.cookies.set("refresh_token", refresh_token)
    refresh_response = client.post("/api/auth/refresh")
    assert refresh_response.status_code == 401


def test_responses_never_contain_password_hash(client):
    register_response = _register(client)
    assert "password_hash" not in register_response.text

    me_response = client.get("/api/auth/me")
    assert "password_hash" not in me_response.text

    login_response = client.post(
        "/api/auth/login", json={"email": "alice@example.com", "password": VALID_PASSWORD}
    )
    assert "password_hash" not in login_response.text
