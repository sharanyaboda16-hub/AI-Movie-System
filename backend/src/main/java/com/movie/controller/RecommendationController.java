package com.movie.controller;

import com.movie.entity.Movie;
import com.movie.service.RecommendationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(
            RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    // Get movie recommendations for a user
    @GetMapping("/{userId}")
    public List<Movie> getRecommendations(
            @PathVariable Long userId) {

        return recommendationService.getRecommendations(userId);
    }
}