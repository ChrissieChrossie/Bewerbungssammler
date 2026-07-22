# Backend-Werte (bucket/key/region/dynamodb_table) werden bewusst NICHT hier
# hinterlegt, da Terraform in Backend-Blöcken keine Variablen erlaubt.
# Stattdessen per -backend-config beim "terraform init" übergeben, z.B.:
#
#   terraform init \
#     -backend-config="bucket=<tf_state_bucket aus dem Bootstrap-Output>" \
#     -backend-config="key=bewerbungssammler/terraform.tfstate" \
#     -backend-config="region=eu-central-1" \
#     -backend-config="dynamodb_table=<tf_lock_table aus dem Bootstrap-Output>"
#
# Siehe README.md sowie .github/workflows/terraform.yml für die konkrete
# Verwendung in GitHub Actions.
terraform {
  backend "s3" {}
}
