<settings-users>
	<form>
		<div class="field sources">
			<label>User accounts</label>
			<ul>
				<li onClick={ editUser } each={ user in users }>
					<span class="username">{ user.name }</span>
					<i if={ user != editing } onClick={ editUser } class="noselect material-icons md-18">edit</i>
					<div class="edit" if={ user == editing }>
						<div class="field">
							<label if={ user.isNew } for={ "name_" + user.name }>Username</label>
							<input if={ user.isNew } id={ "name_" + user.name } type="text" value={ user.name } oninput={ onUsernameInput } placeholder="username"/>
						</div>

						<div class="field">
							<label for={ "password_" + user.name }>New password</label>
							<input type="password" id={ "password_" + user.name } value={ user.password } oninput={ onPasswordInput }/>
						</div>

						<div class="field">
							<label for={ "password_confirm_" + user.name }>Confirm new password</label>
							<input type="password" id={ "password_confirm_" + user.name } value={ user.password_confirm } oninput={ onPasswordConfirmInput }/>
						</div>

						<div class="field">
							<input type="checkbox" id={ "admin_" + user.name } checked={ user.admin } onchange={ onAdminInput }/><label for={ "admin_" + user.name } class="admin">Administrator</label>
							<p class="tip">Grants access to this settings page.</p>
						</div>

						<div class="field delete_container">
							<button class="danger delete" onClick={ deleteUser }>Delete { user.name }</button>
						</div>
					</div>
				</li>
			</ul>
			<button onClick={ addUser }>Add user</button>
		</div>
		<input type="submit" value="Apply"/>
	</form>

	<script>
		this.users = [
			{ name: "agersant" },
			{ name: "trevor" },
			{ name: "junkrat" },
		];

		addUser(e) {
			e.preventDefault();
			var newUser = { name: "New User", isNew: true, };
			this.users.push(newUser);
			this.editing = newUser;
		}

		editUser(e) {
			this.editing = e.item.user;
		}

		deleteUser(e) {
			e.stopPropagation();
			// TODO don't delete current user
			if (this.users.length == 1) {
				return;
			} else {
				var userIndex = this.users.indexOf(e.item.user);
				if (userIndex >= 0) {
					this.users.splice(userIndex, 1);
				}
			}
		}

		onUsernameInput(e) {
			e.item.user.name = e.target.value;
		}

		onPasswordInput(e) {
			e.item.user.password = e.target.value;
		}

		onPasswordConfirmInput(e) {
			e.item.user.passwordConfirm = e.target.value;
		}

		onAdminInput(e) {
			e.item.user.admin = e.target.checked;
		}
	</script>

	<style>
		ul {
			width: 100%;
			box-sizing: border-box;
			border: 1px solid #AAA;
			border-radius: 3px;
			margin-bottom: 10px;
		}

		li {
			padding: 5px;
			padding-left: 10px;
			padding-right: 10px;
		}

		li:not(:last-child) {
			border-bottom: 1px solid #AAA;
		}

		span.username {
			cursor: default;
		}

		.edit {
			padding-left: 20px;
			margin-top: 20px;
		}

		input[type="checkbox"] {
			margin-right: 5px;
			display: inline;
			width: auto;
			position: relative;
			top: 1px;
		}

		label.admin {
			display: inline;
		}

		button.delete {
			margin-top: 10px;
			margin-right: 10px;
			margin-bottom: 15px;
		}

		i {
			float: right;
			text-align: right;
			cursor: pointer;
			position: relative;
			top: 4px;
		}

		.field .delete_container {
			display: flex;
			flex-flow: row nowrap;
			justify-content: flex-end;
			align-items: stretch;
			margin-bottom: 0;
		}
	</style>
</settings-users>
