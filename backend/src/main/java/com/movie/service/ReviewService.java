package com.movie.service;

import com.movie.entity.Movie;
import com.movie.entity.Review;
import com.movie.entity.User;
import com.movie.repository.MovieRepository;
import com.movie.repository.ReviewRepository;
import com.movie.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            MovieRepository movieRepository,
            UserRepository userRepository) {

        this.reviewRepository = reviewRepository;
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
    }

    // Get all reviews
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    // Add review
    public Review addReview(
            Long movieId, Long userId, Review review) {

        if (review.getRating() == null
                || review.getRating() < 1
                || review.getRating() > 10) {
            throw new IllegalArgumentException(
                    "Rating must be between 1 and 10");
        }

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() ->
                        new RuntimeException("Movie not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        review.setMovie(movie);
        review.setUser(user);

        return reviewRepository.save(review);
    }

    // Get reviews for a movie
    public List<Review> getReviewsByMovie(Long movieId) {
        return reviewRepository.findByMovieId(movieId);
    }

    // Get reviews by a user
    public List<Review> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    // Delete review
    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new RuntimeException("Review not found");
        }

        reviewRepository.deleteById(id);
    }
}
