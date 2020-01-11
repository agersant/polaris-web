<settings-users>
	<form if={ users } onsubmit={ save }>
		<div class="field sources">
			<label>User accounts</label>
			<ul>
				<li onClick={ editUser } each={ user in users }>
					<span class="username">{ user.name }</span>
					<i if={ user == editing } onClick={ stopEditUser } class="noselect material-icons md-18">expand_more</i>
					<i if={ user != editing } onClick={ editUser } class="noselect material-icons md-18">chevron_right</i>
					<div class="edit" if={ user == editing }>
						<div class="field">
							<label if={ user.isNew } for={ "name_" + user.name }>Username</label>
							<input if={ user.isNew } id={ "name_" + user.name } type="text" value={ user.name } oninput={ onUsernameInput }/>
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

						<div class="field delete_container">
							<button if={ !isSelf(user) } class="danger delete" onClick={ deleteUser }>Delete { user.name }</button>
						</div>
					</div>
				</li>
			</ul>
			<button onClick={ addUser }>Add user</button>
		</div>
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

		editUser(e) {
			this.editing = e.item.user;
		}

		stopEditUser(e) {
			e.stopPropagation();
			this.editing = null;
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
			width: 100%;
			box-sizing: border-box;
			border: 1px solid var(--theme-border);
			border-radius: 3px;
			margin-bottom: 10px;
		}

		li {
			padding: 5px;
			padding-left: 10px;
			padding-right: 10px;
		}

		li:not(:last-child) {
			border-bottom: 1px solid var(--theme-border);
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
