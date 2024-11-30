<script>
import HeaderComponent from "../components/HeaderComponent.vue";
import FooterComponent from "../components/FooterComponent.vue";
import SearchBarComponent from "../components/SearchBarComponent.vue";
import ResultsComponent from "../components/ResultsComponent.vue";

export default {
  name: "SearchPage",
  components: {
    HeaderComponent,
    FooterComponent,
    SearchBarComponent,
    ResultsComponent,
  },
};
</script>

<template>
  <div>
    <HeaderComponent />
    <div class="container mx-auto px-4 py-4">
      <SearchBarComponent />
      <div class="mt-8">
        <ResultsComponent />
      </div>
    </div>
    <FooterComponent />
  </div>
</template>
