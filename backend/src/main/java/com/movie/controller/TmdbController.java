
package com.movie.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class TmdbController {

    @Value("${tmdb.api.token}")
    private String tmdbToken;

    private final RestTemplate restTemplate = new RestTemplate();

    private ResponseEntity<String> callTmdb(String url) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(tmdbToken);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        org.springframework.http.HttpEntity<Void> request =
                new org.springframework.http.HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                org.springframework.http.HttpMethod.GET,
                request,
                String.class
        );

        return ResponseEntity.ok(response.getBody());
    }

    // Search movies by title
    @GetMapping("/api/tmdb/search")
    public ResponseEntity<String> searchMovies(
            @RequestParam String query) {

        String url = UriComponentsBuilder
                .fromUriString("https://api.themoviedb.org/3/search/movie")
                .queryParam("query", query)
                .build()
                .encode()
                .toUriString();

        return callTmdb(url);
    }

    // Get actual trending movies
    @GetMapping("/api/tmdb/trending")
    public ResponseEntity<String> getTrendingMovies() {

        String url =
                "https://api.themoviedb.org/3/trending/movie/week";

        return callTmdb(url);
    }
}
