// A trimmed, representative ansible_facts result for a RHEL 9 classroom host.
// Real output has several hundred keys; these are the ones worth knowing.
export const sampleFacts = {
  hostname: 'servera',
  fqdn: 'servera.lab.example.com',
  domain: 'lab.example.com',
  distribution: 'RedHat',
  distribution_version: '9.0',
  distribution_major_version: '9',
  os_family: 'RedHat',
  kernel: '5.14.0-70.13.1.el9_0.x86_64',
  architecture: 'x86_64',
  python_version: '3.9.10',
  processor_count: 1,
  processor_vcpus: 2,
  memtotal_mb: 960,
  memfree_mb: 412,
  default_ipv4: {
    address: '172.25.250.10',
    interface: 'eth0',
    gateway: '172.25.250.254',
    netmask: '255.255.255.0',
  },
  all_ipv4_addresses: ['172.25.250.10'],
  interfaces: ['eth0', 'lo'],
  dns: {
    nameservers: ['172.25.250.254'],
    search: ['lab.example.com'],
  },
  devices: {
    vda: {
      size: '10.00 GB',
      partitions: {
        vda1: { size: '1.00 MB' },
        vda4: { size: '9.89 GB' },
      },
    },
  },
  selinux: { status: 'enabled', mode: 'enforcing' },
  virtualization_role: 'guest',
  ansible_local: {},
};
