variable "tenancy_ocid" {
  description = "OCI Tenancy OCID"
  type        = string
}

variable "user_ocid" {
  description = "OCI User OCID"
  type        = string
}

variable "fingerprint" {
  description = "OCI API Key Fingerprint"
  type        = string
}

variable "private_key_path" {
  description = "Path to OCI private key"
  type        = string
  default     = "~/.oci/oci_api_key.pem"
}

variable "region" {
  description = "OCI Region"
  type        = string
  default     = "us-ashburn-1"
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "ubuntu_image_ocid" {
  description = "OCID of Ubuntu image"
  type        = string
  default     = "ocid1.image.oc1.iad.aaaaaaaab3w2i5zkrzxmf7axuy2p642y7v7uhxap3jsmgm6gmwpmz3vngula" # Ubuntu 22.04 minimal
}
