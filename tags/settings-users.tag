<settings-users>
	<form if={ users } onsubmit={ save }>
		<label>User accounts</label>
		<ul>
			<li each={ user in users }>
				<span class="username" onClick={ toggleEditUser }>
					{ user.name }
					<i if={ user == editing } class="noselect material-icons md-18">expand_more</i>
					<i if={ user != editing } class="noselect material-icons md-18">chevron_right</i>
				</span>

				<div class="edit" if={ user == editing }>
					<div class="field" if={ user.isNew }>
						<label for={ "name_" + user.name }>Username</label>
						<input id={ "name_" + user.name } type="text" value={ user.name } oninput={ onUsernameInput }/>
					</div>

					<div class="field">
						<label for={ "password_" + user.name }>New password</label>
						<input type="password" id={ "password_" + user.name } value={ user.password } oninput={ onPasswordInput }/>
						<p if={ !this.validatePassword(user) } class="tip error">The password cannot be blank.</p>
					</div>

					<div class="field">
						<label for={ "password_confirm_" + user.name }>Confirm new password</label>
						<input type="password" id={ "password_confirm_" + user.name } value={ user.password_confirm } oninput={ onPasswordConfirmInput }/>
						<p if={ !this.validatePasswordConfirmation(user) } class="tip error">The password confirmation does not match the new password.</p>
					</div>

					<div class="field">
						<input type="checkbox" id={ "admin_" + user.name } disabled={ isSelf(user) } checked={ user.admin } onchange={ onAdminInput }/><label for={ "admin_" + user.name } class="admin">Administrator</label>
						<p class="tip">Grants access to all settings.</p>
					</div>

					<div if={ !isSelf(user) } class="delete_container">
						<button class="danger delete" onClick={ deleteUser }>Delete { user.name }</button>
					</div>
				</div>
			</li>
		</ul>
		<button class="add-user" onClick={ addUser }>Add user</button>
		<settings-apply disabled={ !validatePasswords() } />
	</form>

	<script>

		var self = this;
		this.config = null;
		this.users = null;

		this.on('mount', function() {
			fetch("api/settings/", { credentials: "same-origin" })
			.then(function(res) { return res.json(); })
			.then(function(data) {
				this.config = data;
				this.users = data.users;
				this.update();
			}.bind(self));
		});

		isSelf(user) {
			return user.name == Cookies.get("username");
		}

		validatePassword(user) {
			return user.password || !user.isNew;
		}

		validatePasswordConfirmation(user) {
			return !user.password || user.password_confirm === user.password;
		}

		validatePasswords() {
			return this.users.every(function(user) {
				return this.validatePassword(user) && this.validatePasswordConfirmation(user);
			}.bind(this));
		}

		setContent(users) {
			this.users = users;
		}

		addUser(e) {
			e.preventDefault();
			var newUser = { name: "New User", password: "", isNew: true, admin: false };
			this.users.push(newUser);
			this.editing = newUser;
		}

		toggleEditUser(e) {
			e.stopPropagation();
			if (this.editing == e.item.user) {
				this.editing = null;
			} else {
				this.editing = e.item.user;
			}
		}

		deleteUser(e) {
			e.stopPropagation();
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
			e.item.user.password_confirm = e.target.value;
		}

		onAdminInput(e) {
			e.item.user.admin = e.target.checked;
		}

		save(e) {
			e.preventDefault();
			eventBus.trigger("settings:submitConfig", this.config);
		}
	</script>

	<style>
		ul {
			width: calc(70% + 40px);
			padding-left: 20px;
			padding-right: 20px;
			margin-bottom: 10px;
			background-color: var(--theme-background-muted);
			border-radius: 10px;
		}

		li {
		}

		li:not(:last-child) {
			border-bottom: 1px solid var(--theme-border-muted);
		}

		span.username {
			display: inline-block;
			width: 100%;
			cursor: pointer;
			font-weight: 600;
			padding-top: 10px;
			padding-bottom: 10px;
		}

		.edit {
			padding-left: 20px;
			padding-right: 20px;
			padding-top: 15px;
			background-color: var(--theme-background-muted);
			border-radius: 5px;
			margin-bottom: 10px;
		}

		form .edit .field {
			width: 100%;
			padding: 0px;
			margin-bottom: 15px;
		}

		.edit label {
			font-weight: 400;
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

		i {
			float: right;
			text-align: right;
			cursor: pointer;
			position: relative;
			top: 4px;
		}

		.delete_container {
			display: flex;
			flex-flow: row nowrap;
			justify-content: flex-end;
			align-items: stretch;
			padding-bottom: 15px;
		}

		button.add-user {
			margin-bottom: 25px;
		}
	</style>
</settings-users>
