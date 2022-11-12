import { defineStore, acceptHMRUpdate } from "pinia";
import { createUser, deleteUser, updateUser, users } from "@/api/endpoints";
import { NewUser, User, UserUpdate } from "@/api/dto";
import { useUserStore } from "@/stores/user";
import { useInitialSetupStore } from "@/stores/initial-setup";

export type UsersState = {
	listing: User[];
	fetchedInitialState: boolean;
};

export const useUsersStore = defineStore("users", {
	state: (): UsersState => ({
		listing: [],
		fetchedInitialState: false,
	}),
	actions: {
		async refresh() {
			this.listing = await users();
			this.fetchedInitialState = true;
		},

		async create(newUser: NewUser) {
			await createUser(newUser);

			if (this.listing.length > 0) {
				this.refresh();
			} else {
				const user = useUserStore();
				await user.login(newUser.name, newUser.password);
				await this.refresh();
			}
		},

		async update(username: string, userUpdate: UserUpdate) {
			const response = await updateUser(username, userUpdate);
			await this.refresh();
			return response.status == 200;
		},

		async delete(username: string) {
			await deleteUser(username);
			await this.refresh();
		},
	},
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot));
}
