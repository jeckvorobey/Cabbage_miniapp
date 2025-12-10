import { defineStore } from 'pinia';
import { client } from 'src/api/client';
import type { IAddresse } from 'src/types/addresse.interface';
import { ref } from 'vue';

export const useAddressesStore = defineStore('Addresses', () => {
  const addresses = ref<IAddresse[]>();
  const deliveryZones = ref()

  async function fetchAddresses() {
    return client
      .get('addresses')
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[AddressesStore] - An error occurred while fetching via fetchAddresses',
          err.message,
        );
        throw err;
      });
  }

  async function createAddress(address: IAddresse) {
    return client
      .post<any>('addresses', address)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[AddressesStore] - An error occurred while createing via createAddress',
          err.message,
        );
        throw err;
      });
  }

  async function updateAddress( address: IAddresse) {
    return client
      .patch(`/addresses/${address.id}`, address )
      .then((res) => res.data)
      .catch((err) => {
        console.error('[AddressesStore] - An error occurred while creating via updateAddress', err.message)
        throw err
      })
  }

  async function deleteAddress(id: number) {
    return client
      .delete(`addresses/${id}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[AddressesStore] - An error occurred while deleting via deleteAddress',
          err.message,
        );
        throw err;
      });
  }

  async function fetchDeliveryZones() {
    return client
      .get('delivery-zones')
      .then((res) => res.data)
      .catch((err) => {
        console.error(
          '[AddressesStore] - An error occurred while fetching via fetchAddresses',
          err.message,
        );
        throw err;
      });
  }

  return {addresses, deliveryZones, fetchAddresses, createAddress, updateAddress, deleteAddress, fetchDeliveryZones};
});
