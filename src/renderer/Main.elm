port module Main exposing (main)

import Browser
import Html exposing (Html, button, div, form, h5, input, p, text)
import Html.Attributes exposing (class, classList, placeholder, style)
import Html.Events exposing (onClick, onInput)



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
    , bold : Bool
    , italic : Bool
    }


type FontList
    = Loading
    | Fonts (List String)


type alias Presentation p =
    { p
        | bold : Bool
        , italic : Bool
    }


type Presenter
    = Bold
    | Italic


init : () -> ( Model, Cmd Msg )
init _ =
    ( { fonts = Loading
      , search = ""
      , example = ""
      , bold = False
      , italic = False
      }
    , Cmd.none
    )



-- UPDATE


type Msg
    = AddFonts (List String)
    | ChangeExample String
    | ChangeSearch String
    | TogglePresenter Presenter


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        AddFonts fontList ->
            ( { model | fonts = Fonts fontList }, Cmd.none )

        ChangeExample ex ->
            ( { model | example = ex }, Cmd.none )

        ChangeSearch ser ->
            ( { model | search = ser }, Cmd.none )

        TogglePresenter presenter ->
            case presenter of
                Bold ->
                    ( { model | bold = not model.bold }, Cmd.none )

                Italic ->
                    ( { model | italic = not model.italic }, Cmd.none )



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


renderFont : String -> Presentation p -> String -> Html msg
renderFont example presentation font =
    div [ class "col-4" ]
        [ div [ class "card m-2" ]
            [ div [ class "card-body" ]
                [ h5 [ class "card-title" ] [ text font ]
                , p
                    [ classList
                        [ ( "card-text", True )
                        , ( "font-weight-bold", presentation.bold )
                        , ( "font-italic", presentation.italic )
                        ]
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
            ]
        ]


navBar : Model -> Html Msg
navBar model =
    div [ class "navbar sticky-top navbar-light bg-light" ]
        [ div []
            [ form
                [ class "form-inline"
                , style "display" "inline"
                ]
                [ input
                    [ class "form-control mr-sm-2"
                    , placeholder "Example"
                    , onInput ChangeExample
                    ]
                    [ text model.example ]
                ]
            , div [ class "btn-group" ]
                [ button
                    [ classList
                        [ ( "btn", True )
                        , ( "font-weight-bold", True )
                        , ( "btn-primary", model.bold )
                        , ( "btn-outline-primary", not model.bold )
                        ]
                    , onClick (TogglePresenter Bold)
                    ]
                    [ text "B" ]
                , button
                    [ classList
                        [ ( "btn", True )
                        , ( "font-italic", True )
                        , ( "btn-primary", model.italic )
                        , ( "btn-outline-primary", not model.italic )
                        ]
                    , onClick (TogglePresenter Italic)
                    ]
                    [ text "I" ]
                ]
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
                div [ class "alert alert-info m-5" ]
                    [ text "Loading..."
                    , div [ class "progress" ]
                        [ div
                            [ class "progress-bar progress-bar-striped progress-bar-animated bg-info"
                            , style "width" "100%"
                            ]
                            []
                        ]
                    ]

            Fonts fontList ->
                if List.isEmpty fontList then
                    div [] [ text "No Fonts were found." ]

                else
                    div [ class "row" ]
                        (fontList
                            |> List.filter
                                (caselessContains
                                    model.search
                                )
                            |> List.map
                                (renderFont
                                    model.example
                                    model
                                )
                        )
        ]


port receiveFonts : (List String -> msg) -> Sub msg
