port module Main exposing (main)

import Browser
import Html exposing (Html, div, form, h5, input, li, p, text, ul)
import Html.Attributes exposing (class, placeholder, style)
import Html.Events exposing (onInput)
import List exposing (filter, map)



-- MAIN


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , subscriptions = subscriptions
        , view = view
        }



-- MODEL


type alias Model =
    { fonts : FontList
    , search : String
    , example : String
    }


type FontList
    = Loading
    | Fonts (List String)
    | Err String


init : () -> ( Model, Cmd Msg )
init _ =
    ( { fonts = Loading
      , search = ""
      , example = ""
      }
    , Cmd.none
    )



-- UPDATE


type Msg
    = AddFonts (List String)
    | ChangeExample String
    | ChangeSearch String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        AddFonts fontList ->
            ( { model | fonts = Fonts fontList }, Cmd.none )

        ChangeExample ex ->
            ( { model | example = ex }, Cmd.none )

        ChangeSearch ser ->
            ( { model | search = ser }, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    receiveFonts AddFonts



-- VIEW


caselessContains : String -> String -> Bool
caselessContains a b =
    let
        lowerA =
            String.toLower a

        lowerB =
            String.toLower b
    in
    String.contains lowerA lowerB


renderFont : String -> String -> Html msg
renderFont example font =
    li [ class "list-group-item" ]
        [ div [ class "row" ]
            [ div [ class "col" ]
                [ p
                    [ class "card-text"
                    , style "font-family" font
                    , style "font-size" "38px"
                    ]
                    [ text
                        (if String.isEmpty example then
                            font

                         else
                            example
                        )
                    ]
                ]
            , div [ class "col" ] [ h5 [] [ text font ] ]
            ]
        ]


navBar : Model -> Html Msg
navBar model =
    div [ class "navbar sticky-top navbar-light bg-light" ]
        [ form [ class "form-inline" ]
            [ input
                [ class "form-control mr-sm-2"
                , placeholder "Example"
                , onInput ChangeExample
                ]
                [ text model.example ]
            ]
        , form [ class "form-inline" ]
            [ input
                [ class "form-control mr-sm-2"
                , placeholder "Search"
                , onInput ChangeSearch
                ]
                [ text model.search ]
            ]
        ]


view : Model -> Html Msg
view model =
    div [ class "container-fluid px-0" ]
        [ navBar model
        , case model.fonts of
            Loading ->
                div [ class "alert alert-info" ]
                    [ text "Loading..."
                    , div [ class "progress" ]
                        [ div
                            [ class "progress-bar progress-bar-striped bg-info"
                            , style "width" "100%"
                            ]
                            []
                        ]
                    ]

            Fonts fontList ->
                ul [ class "list-group" ]
                    (fontList
                        |> filter (caselessContains model.search)
                        |> map (renderFont model.example)
                    )

            Err error ->
                div [] [ text error ]
        ]


port receiveFonts : (List String -> msg) -> Sub msg
