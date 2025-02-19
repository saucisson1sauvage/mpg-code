$(document).ready(function () {
    function loadMovies(templateSelector) {
        const goodNote = $('#goodNote').val();
        const badNote = $('#badNote').val();
        const origineFilm = $('#FiltrePays').val();

        $('#goodNote').parent().hide();
        $('#badNote').parent().hide();
        $('#movies-container').empty();

        $.ajax({
            url: 'http://localhost:3332/movies',
            type: 'GET',
            dataType: 'json',
            success: function (moviesData) {
                const container = $('#movies-container');

                $.each(moviesData, function (i, movie) {
                    if (origineFilm !== "TOUS" && movie.origine !== origineFilm) {
                        return;
                    }

                    let templateId;

                    if (templateSelector === 'banger' && movie.note >= goodNote) {
                        templateId = 'banger';
                    } else if (templateSelector === 'navet' && movie.note <= badNote) {
                        templateId = 'navets';
                    } else if (templateSelector === 'all') {
                        if (movie.note >= goodNote) {
                            templateId = 'banger';
                        } else if (movie.note <= badNote) {
                            templateId = 'navets';
                        } else {
                            templateId = 'movie-template';
                        }
                    }

                    if (templateId) {
                        const template = document.getElementById(templateId);
                        const instance = document.importNode(template.content, true);

                        $(instance).find('.nom').text(movie.nom);
                        $(instance).find('.dateDeSortie').text(movie.dateDeSortie);
                        $(instance).find('.realisateur').text(movie.realisateur);
                        $(instance).find('.note').text(movie.note);
                        $(instance).find('.notePublic').text(movie.notePublic || 'N/A');
                        $(instance).find('.compagnie').text(movie.compagnie);
                        $(instance).find('.description').text(movie.description);
                        $(instance).find('.lienImage').attr('src', movie.lienImage);

                        const card = templateId === "banger"
                            ? $(instance).find(".movie-card_banger")
                            : $(instance).find(".movie-card");

                        card.attr("data-id", movie.id.toString());

                        if (movie.notePublic > 0) {
                            const difference = Math.abs(movie.note - movie.notePublic).toFixed(1);
                            $(instance).find('.noteDifference').text(difference);
                        } else {
                            $(instance).find('.noteDifference').text('Note public indisponible');
                        }

                        container.append(instance);
                    }
                });
            },
            error: function (xhr, status, error) {
                console.error("Erreur : " + error);
            }
        });
    }

    $('#loadMoviesButton').on('click', function () {
        $(this).hide();
        loadMovies('all');
    });

    $('#importBanger').on('click', function () {
        $(this).hide();
        loadMovies('banger');
    });

    $('#importNavets').on('click', function () {
        $(this).hide();
        loadMovies('navet');
    });

    $('#clearButton').on('click', function () {
        $('#loadMoviesButton').show();
        $('#importBanger').show();
        $('#importNavets').show();
        $('#goodNote').parent().show();
        $('#badNote').parent().show();
        $('#movies-container').empty();
    });

    $(document).on("click", ".delete-movie", function () {
        const card = $(this).closest(".movie-card, .movie-card_banger");
        const movieId = card.attr("data-id");

        if (!movieId) {
            alert("Erreur : ID du film non trouvé.");
            return;
        }

        $.ajax({
            url: `http://localhost:3332/movies/${movieId}`,
            type: "DELETE",
            success: function (response) {
                alert(response.message);
                card.remove();
            },
            error: function (xhr, status, error) {
                console.error("Erreur lors de la suppression :", error);
            }
        });
    });

    $("#add-movie-form").on("submit", function (event) {
        event.preventDefault();

        const newMovie = {
            nom: $("#nom").val(),
            dateDeSortie: $("#dateDeSortie").val(),
            realisateur: $("#realisateur").val(),
            note: parseFloat($("#note").val()),
            notePublic: parseFloat($("#notePublic").val()) || null,
            compagnie: $("#compagnie").val(),
            description: $("#description").val(),
            origine: $("#origine").val(),
            lienImage: $("#lienImage").val()
        };

        $.ajax({
            url: "http://localhost:3332/movies",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(newMovie),
            success: function (response) {
                alert(response.message);
                $("#add-movie-form")[0].reset();
                loadMovies("all");
            },
            error: function (xhr, status, error) {
                console.error("Erreur lors de l'ajout :", error);
            }
        });
    });
});