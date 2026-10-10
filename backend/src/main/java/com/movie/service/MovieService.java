package com.movie.service;

import com.movie.entity.Movie;
import com.movie.repository.MovieRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    // Get all movies
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    // Get movie by ID
    public Optional<Movie> getMovieById(Long id) {
        return movieRepository.findById(id);
    }

    // Add movie
    public Movie addMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    // Update movie
    public Movie updateMovie(Long id, Movie movieDetails) {

        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        movie.setTitle(movieDetails.getTitle());
        movie.setGenre(movieDetails.getGenre());
        movie.setLanguage(movieDetails.getLanguage());
        movie.setYear(movieDetails.getYear());
        movie.setRating(movieDetails.getRating());
        movie.setDescription(movieDetails.getDescription());

        return movieRepository.save(movie);
    }

    // Delete movie
    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }

    // Search movies by title
    public List<Movie> searchMovies(String title) {
        return movieRepository.findByTitleContainingIgnoreCase(title);
    }

    // Get movies by genre
    public List<Movie> getMoviesByGenre(String genre) {
        return movieRepository.findByGenreIgnoreCase(genre);
    }
} 