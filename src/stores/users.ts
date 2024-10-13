import { defineStore, acceptHMRUpdate } from "pinia";
import { ShallowRef, shallowRef } from "vue";

import { createUser, deleteUser as doDeleteUser, getUsers, updateUser } from "@/api/endpoints";
import { NewUser, User, UserUpdate } from "@/api/dto";
import { useUserStore } from "@/stores/user";

export const useUsersStore = defineStore("users", () => {

	const listing: ShallowRef<User[] | undefined> = shallowRef(undefined);

	async function refresh() {
		listing.value = await getUsers();
	}

	async function create(newUser: NewUser) {
		await createUser(newUser);
		if (listing.value?.length == 0) {
			const user = useUserStore();
			await user.login(newUser.name, newUser.password);
		}
		await refresh();
	}

	async function update(username: string, userUpdate: UserUpdate) {
		const response = await updateUser(username, userUpdate);
		await refresh();
		return response.status == 200;
	}

	async function deleteUser(username: string) {
		await doDeleteUser(username);
		await refresh();
	}

	return {
		listing,

		create,
		deleteUser,
		refresh,
		update,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot));
}
