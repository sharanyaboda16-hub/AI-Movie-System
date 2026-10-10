
package com.movie.service;

import com.movie.entity.Movie;
import com.movie.entity.Review;
import com.movie.entity.User;
import com.movie.repository.MovieRepository;
import com.movie.repository.ReviewRepository;
import com.movie.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    public RecommendationService(
            MovieRepository movieRepository,
            UserRepository userRepository,
            ReviewRepository reviewRepository) {
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
    }

    public List<Movie> getRecommendations(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Movie> movies = movieRepository.findAll();
        List<Review> allReviews = reviewRepository.findAll();
        List<Review> userReviews = reviewRepository.findByUserId(userId);

        Set<Long> reviewedMovieIds = userReviews.stream()
                .filter(review -> review.getMovie() != null)
                .map(review -> review.getMovie().getId())
                .collect(Collectors.toSet());

        Map<Long, Double> averageRatings = allReviews.stream()
                .filter(review -> review.getMovie() != null)
                .collect(Collectors.groupingBy(
                        review -> review.getMovie().getId(),
                        Collectors.averagingDouble(Review::getRating)
                ));

        Comparator<Movie> byRating = Comparator
                .comparingDouble((Movie movie) -> {
                    Double average = averageRatings.get(movie.getId());
                    if (average != null) {
                        return average;
                    }

                    Double rating = movie.getRating();
                    return rating != null ? rating : 0.0;
                })
                .reversed()
                .thenComparing(
                        Movie::getTitle,
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
                );

        List<Movie> eligibleMovies = movies.stream()
                .filter(movie -> !reviewedMovieIds.contains(movie.getId()))
                .toList();

        String preferredGenre = user.getPreferredGenre();

        List<Movie> recommendations = List.of();

        if (preferredGenre != null && !preferredGenre.isBlank()) {
            recommendations = eligibleMovies.stream()
                    .filter(movie -> movie.getGenre() != null
                            && movie.getGenre().trim()
                            .equalsIgnoreCase(preferredGenre.trim()))
                    .sorted(byRating)
                    .limit(5)
                    .toList();
        }

        if (recommendations.isEmpty()) {
            recommendations = eligibleMovies.stream()
                    .sorted(byRating)
                    .limit(5)
                    .toList();
        }

        return recommendations;
    }
}