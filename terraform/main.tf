terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 6.0"
    }
  }
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

# Compartment
resource "oci_identity_compartment" "newspiston" {
  name        = "newspiston"
  description = "NewsPiston Intelligence Platform"
}

# VCN
resource "oci_core_vcn" "newspiston_vcn" {
  compartment_id = oci_identity_compartment.newspiston.id
  cidr_block     = "10.0.0.0/16"
  display_name   = "newspiston-vcn"
  dns_label      = "newspiston"
}

# Internet Gateway
resource "oci_core_internet_gateway" "newspiston_igw" {
  compartment_id = oci_identity_compartment.newspiston.id
  vcn_id         = oci_core_vcn.newspiston_vcn.id
  display_name   = "newspiston-igw"
}

# Route Table
resource "oci_core_default_route_table" "newspiston_rt" {
  manage_default_resource_id = oci_core_vcn.newspiston_vcn.default_route_table_id

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.newspiston_igw.id
  }
}

# Security List
resource "oci_core_default_security_list" "newspiston_sl" {
  manage_default_resource_id = oci_core_vcn.newspiston_vcn.default_security_list_id

  ingress_security_rules {
    protocol  = "6" # TCP
    source    = "0.0.0.0/0"
    stateless = false

    tcp_options {
      min = 22
      max = 22
    }
  }

  ingress_security_rules {
    protocol  = "6" # TCP
    source    = "0.0.0.0/0"
    stateless = false

    tcp_options {
      min = 80
      max = 80
    }
  }

  ingress_security_rules {
    protocol  = "6" # TCP
    source    = "0.0.0.0/0"
    stateless = false

    tcp_options {
      min = 443
      max = 443
    }
  }

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
    stateless   = false
  }
}

# Subnet
resource "oci_core_subnet" "newspiston_subnet" {
  compartment_id    = oci_identity_compartment.newspiston.id
  vcn_id            = oci_core_vcn.newspiston_vcn.id
  cidr_block        = "10.0.1.0/24"
  display_name      = "newspiston-subnet"
  dns_label         = "sub"
  security_list_ids = [oci_core_vcn.newspiston_vcn.default_security_list_id]
  route_table_id    = oci_core_vcn.newspiston_vcn.default_route_table_id
}

# Compute Instance (Always Free A1.Flex)
resource "oci_core_instance" "newspiston_instance" {
  compartment_id = oci_identity_compartment.newspiston.id
  display_name   = "newspiston-server"
  shape          = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = 1
    memory_in_gbs = 6
  }

  source_details {
    source_type = "image"
    source_id   = var.ubuntu_image_ocid
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.newspiston_subnet.id
    assign_public_ip = true
  }

  metadata = {
    ssh_authorized_keys = file(var.ssh_public_key_path)
    user_data           = base64encode(templatefile("${path.module}/cloud-init.yaml", {}))
  }

  lifecycle {
    ignore_changes = [source_details]
  }
}

# Outputs
output "instance_public_ip" {
  value = oci_core_instance.newspiston_instance.public_ip
}

output "instance_ocid" {
  value = oci_core_instance.newspiston_instance.id
}
