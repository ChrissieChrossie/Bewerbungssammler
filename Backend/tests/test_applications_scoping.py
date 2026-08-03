"""Tests: Bewerbungen sind strikt auf den eingeloggten Nutzer gescoped."""


def _register(client, email, name="Test User", password="correct-horse-battery-9"):
    response = client.post(
        "/api/auth/register",
        json={"name": name, "email": email, "password": password, "password_confirm": password},
    )
    assert response.status_code == 201
    return response.json()


def _create_job_posting(client):
    company = client.post("/api/companies/", json={"name": "Acme GmbH"})
    assert company.status_code == 201
    job = client.post(
        "/api/job-postings/",
        json={"title": "Backend Engineer", "company_id": company.json()["id"]},
    )
    assert job.status_code == 201
    return job.json()["id"]


def test_create_application_ignores_client_supplied_user_id(client):
    user = _register(client, "alice@example.com")
    job_posting_id = _create_job_posting(client)

    # Ein böswillig/fälschlich mitgeschicktes user_id-Feld darf keine Wirkung haben --
    # das Schema kennt das Feld beim Anlegen gar nicht mehr.
    response = client.post(
        "/api/applications/",
        json={
            "job_posting_id": job_posting_id,
            "applied_at": "2026-08-01",
            "status": "open",
            "user_id": 9999,
        },
    )

    assert response.status_code == 201
    assert response.json()["user_id"] == user["id"]


def test_users_only_see_their_own_applications(client):
    _register(client, "alice@example.com")
    job_posting_id = _create_job_posting(client)
    client.post(
        "/api/applications/",
        json={"job_posting_id": job_posting_id, "applied_at": "2026-08-01", "status": "open"},
    )
    client.cookies.clear()

    _register(client, "bob@example.com", name="Bob")
    bob_response = client.post(
        "/api/applications/",
        json={"job_posting_id": job_posting_id, "applied_at": "2026-08-02", "status": "open"},
    )
    bob_application_id = bob_response.json()["id"]

    listing = client.get("/api/applications/")
    assert listing.status_code == 200
    ids = [app["id"] for app in listing.json()]
    assert ids == [bob_application_id]


def test_cannot_read_or_delete_another_users_application(client):
    _register(client, "alice@example.com")
    job_posting_id = _create_job_posting(client)
    alice_app = client.post(
        "/api/applications/",
        json={"job_posting_id": job_posting_id, "applied_at": "2026-08-01", "status": "open"},
    ).json()
    client.cookies.clear()

    _register(client, "bob@example.com", name="Bob")

    get_response = client.get(f"/api/applications/{alice_app['id']}")
    assert get_response.status_code == 404

    delete_response = client.delete(f"/api/applications/{alice_app['id']}")
    assert delete_response.status_code == 404


def test_applications_endpoints_require_auth(client):
    response = client.get("/api/applications/")
    assert response.status_code == 401
