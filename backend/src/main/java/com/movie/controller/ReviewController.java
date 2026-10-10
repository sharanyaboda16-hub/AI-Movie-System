package com.movie.controller;

import com.movie.entity.Review;
import com.movie.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // Get all reviews
    @GetMapping
    public List<Review> getAllReviews() {
        return reviewService.getAllReviews();
    }

    // Add review
    @PostMapping
    public Review addReview(
            @RequestParam Long movieId,
            @RequestParam Long userId,
            @RequestBody Review review) {

        return reviewService.addReview(movieId, userId, review);
    }

    // Get reviews for a movie
    @GetMapping("/movie/{movieId}")
    public List<Review> getReviewsByMovie(
            @PathVariable Long movieId) {

        return reviewService.getReviewsByMovie(movieId);
    }

    // Get reviews by a user
    @GetMapping("/user/{userId}")
    public List<Review> getReviewsByUser(
            @PathVariable Long userId) {

        return reviewService.getReviewsByUser(userId);
    }

    // Delete review
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id) {

        reviewService.deleteReview(id);

        return ResponseEntity.noContent().build();
    }
}