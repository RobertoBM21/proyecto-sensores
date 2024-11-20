<script>
import HeaderComponent from "../components/HeaderComponent.vue";
import FooterComponent from "../components/FooterComponent.vue";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default {
  name: "LoginPage",
  components: {
    HeaderComponent,
    FooterComponent,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Button,
    Input,
    Label,
  },
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    handleLogin() {
      // Mock login
      this.$router.push("/home");
    },
    handleGoogleLogin() {
      // Mock Google login
      this.$router.push("/home");
    },
    handleGithubLogin() {
      // Mock Github login
      this.$router.push("/home");
    },
  },
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <HeaderComponent />
    <main class="flex-grow flex items-center justify-center">
      <Card class="w-full max-w-md">
        <CardHeader>
          <CardTitle class="text-center">Iniciar Sesión</CardTitle>
          <CardDescription class="text-center mt-2">
            Para usar la aplicación es necesario iniciar sesión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div class="space-y-2">
              <Label for="email">Correo electrónico</Label>
              <Input id="email" type="email" v-model="email" />
            </div>
            <div class="space-y-2">
              <Label for="password">Contraseña</Label>
              <Input id="password" type="password" v-model="password" />
            </div>
            <Button type="submit" class="w-full">Iniciar Sesión</Button>
          </form>

          <div class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-background px-2 text-muted-foreground"
                >o continua con</span
              >
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <Button @click="handleGoogleLogin" variant="outline">
              <img
                src="@/assets/icons/google.svg"
                alt="Google"
                class="w-5 h-5 mr-2"
              />
              Google
            </Button>
            <Button @click="handleGithubLogin" variant="outline">
              <img
                src="@/assets/icons/github-light.svg"
                alt="GitHub"
                class="w-5 h-5 mr-2"
              />
              GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
    <FooterComponent />
  </div>
</template>
