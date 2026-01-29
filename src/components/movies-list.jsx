import { useEffect, useState} from "react";
import MovieDataService from "../services/movies";
import { Link } from "react-router-dom";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";


const MoviesList = () => {
    const [movies, setMovies] = useState([]);
    const [searchTitle, setSearchTitle] = useState("");
    const [searchRating, setSearchRating] = useState("All Ratings");
    const [ratings, setRatings] = useState(["All Ratings"]);

    const [currentPage, setCurrentPage] = useState(0);
    const [entriesPerPage, setEntriesPerPage] = useState(0);
    const [appliedSearch, setAppliedSearch] = useState({
        mode: "",
        title: "",
        rating: "",
    });

    const retrieveMovies = async () => {
        try {
            const response = await MovieDataService.getAll(currentPage);
            const data = response.data;

            setMovies(data.movies);
            setCurrentPage(data.page);
            setEntriesPerPage(data.entries_per_page);
        } catch (e) {
            console.error(e);
        }
    };

    const retrieveRatings = async () => {
        try {
            const response = await MovieDataService.getRating();

            setRatings(["All Ratings", ...response.data]);
        } catch (e) {
            console.error(e);
        }
    };

    const find = async (query, by, page) => {
        try {
            const response = await MovieDataService.find(query, by, page);
            const data = response.data;

            setMovies(data.movies);
            setCurrentPage(data.page);
            setEntriesPerPage(data.entries_per_page);
        } catch (e) {
            console.error(e);
        }
    };

    const findByTitle = async () => {
        setCurrentPage(0);
        setAppliedSearch({ mode: "findByTitle", title: searchTitle, rating: "" });
        await find(searchTitle, "title", 0);
    };

    const findByRating = async () => {
        setCurrentPage(0);

        if (searchRating === "All Ratings") {
            setAppliedSearch({ mode: "", title: "", rating: "" });
            await retrieveMovies(0);
        } else {
            setAppliedSearch({
                mode: "findByRating",
                title: "",
                rating: searchRating,
            });
            await find(searchRating, "rated", 0);
        }
    };

    useEffect(() => {
        (async () => {
            await retrieveRatings();
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if (appliedSearch.mode === "findByTitle") {
                await find(appliedSearch.title, "title", currentPage);
            } else if (appliedSearch.mode === "findByRating") {
                await find(appliedSearch.rating, "rated", currentPage);
            } else {
                await retrieveMovies(currentPage);
            }
        })();
    }, [currentPage, appliedSearch]);

    const onChangeSearchTitle = (e) => {
        setSearchTitle(e.target.value);
    };

    const onChangeSearchRating = (e) => {
        setSearchRating(e.target.value);
    };

    return (
        <div className="App">
            <Container>
                <h2 className="my-3">Movie Search</h2>

                <Form className="mb-4">
                    <Row>
                        <Col md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Search by title"
                                value={searchTitle}
                                onChange={onChangeSearchTitle}
                            />
                            <Button className="mt-2" onClick={findByTitle}>
                                Search
                            </Button>
                        </Col>

                        <Col md={6}>
                            <Form.Select value={searchRating} onChange={onChangeSearchRating}>
                                {ratings.map((rating) => (
                                    <option key={rating} value={rating}>
                                        {rating}
                                    </option>
                                ))}
                            </Form.Select>
                            <Button className="mt-2" onClick={findByRating}>
                                Search
                            </Button>
                        </Col>
                    </Row>
                </Form>

                <Row className="g-4">
                    {movies.map((movie) => (
                        <Col md={4} key={movie._id}>
                            <Card>
                                <Card.Img
                                    variant="top"
                                    src={movie.poster ? `${movie.poster}/100px180` : ""}
                                    alt={movie.title}
                                />
                                <Card.Body>
                                    <Card.Title>{movie.title}</Card.Title>
                                    <Card.Text>
                                        <strong>Rating:</strong> {movie.rated ?? ""}
                                    </Card.Text>
                                    <Card.Text>{movie.plot ?? ""}</Card.Text>
                                    <Link to={`/movies/${movie._id}`}>View Reviews</Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {movies.length > 0 && (
                    <div className="mt-4 text-center">
                        <p>Showing Page: {currentPage}</p>
                        <Button variant="link" onClick={() => setCurrentPage((p) => p + 1)}>
                            Get next {entriesPerPage} results
                        </Button>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default MoviesList;
