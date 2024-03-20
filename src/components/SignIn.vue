<template>
    <div class="register-container">
            <div class="login-body">
            <h2>Register</h2>
            <div class="form">
                <form class="loginForm">
                    <input class="p-1 mb-3" placeholder="username" required type="text" /> <br/>
                    <input class="p-1 mb-3" placeholder="password"  required type="password" /> <br/>
                    <input class="p-1 mb-3" placeholder="confirm password" required type="password" /> <br/>
                    <button class="btn btn-primary me-4" type="submit">Sign up</button>
                    <a class="ms-5 loginViewToggle">Log in</a>

                </form>
                </div>
            </div>
            </div>
            
            <div  class="login-container">
            <div class="login-body">
                <h2>Login</h2>
                <div class="form">
                    <form  class="loginForm">
                        <input class="p-1 mb-3" placeholder="username"  required  type="text" /> <br/>
                        <input class="p-1 mb-3" placeholder="password"  required  type="password" /> <br/>
                        <button class="btn btn-primary me-4" type="submit">Login</button>
                        <a class="ms-5 loginViewToggle">Sign up</a>
                    </form>
                </div>
            </div>
        </div>
</template>

<script setup>
   
</script>

<style scoped>
    .login-container {
  position:absolute;
  background: white;
  width: 15vw;
  height: 30vh;
  right: 2vw;
  bottom: 10vh;
  border-radius: 16px;
}

.login-body {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.register-container {
  position:absolute;
  background: white;
  width: 15vw;
  height: 35vh;
  right: 2vw;
  bottom: 10vh;
  border-radius: 16px;
}

.loginViewToggle, .navbar-action {
  cursor: pointer;
  user-select: none;
}

.navbar-action:hover {
  box-shadow: 2px 2px 2px gray;
}

.navBarActivator {
  position:absolute;
  bottom:0;
  height: 80px;
  width: 100%;
}
</style>