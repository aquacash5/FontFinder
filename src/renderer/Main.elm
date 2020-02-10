port module Main exposing (main)

import Browser
import Html exposing (Html, button, div, form, h5, input, p, text)
import Html.Attributes exposing (class, classList, placeholder, style, type_, value)
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
    , fontSize : Int
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
        , fontSize : Int
    }


type Presenter
    = Bold
    | Italic


init : () -> ( Model, Cmd Msg )
init _ =
    ( { fonts = Loading
      , example = ""
      , search = ""
      , fontSize = 38
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
    | ChangeFontSize String
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

        ChangeFontSize strSize ->
            case String.toInt strSize of
                Nothing ->
                    ( model, Cmd.none )

                Just size ->
                    ( { model | fontSize = size }, Cmd.none )

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
    div
        [ class "col-lg-4"
        , class "col-md-6"
        , class "col-12"
        ]
        [ div
            [ class "card"
            , class "my-2"
            ]
            [ div [ class "card-body" ]
                [ h5 [ class "card-title" ] [ text font ]
                , p
                    [ classList
                        [ ( "card-text", True )
                        , ( "font-weight-bold", presentation.bold )
                        , ( "font-italic", presentation.italic )
                        ]
                    , style "font-family" font
                    , style "font-size" (String.fromInt presentation.fontSize ++ "px")
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


presenterButton : String -> Bool -> Presenter -> String -> Html Msg
presenterButton fontClass enabled presenter label =
    button
        [ classList
            [ ( "btn", True )
            , ( fontClass, True )
            , ( "btn-secondary", enabled )
            , ( "btn-outline-secondary", not enabled )
            ]
        , style "width" "40px"
        , onClick (TogglePresenter presenter)
        ]
        [ text label ]


navBar : Model -> Html Msg
navBar model =
    div
        [ class "navbar"
        , class "sticky-top"
        , class "navbar-light"
        , class "bg-light"
        ]
        [ div []
            [ form
                [ class "form-inline"
                , style "display" "inline"
                ]
                [ input
                    [ class "form-control"
                    , class "mr-sm-2"
                    , placeholder "Example"
                    , onInput ChangeExample
                    ]
                    [ text model.example ]
                ]
            , div [ class "btn-group" ]
                [ presenterButton "font-weight-bold" model.bold Bold "B"
                , presenterButton "font-italic" model.italic Italic "I"
                ]
            , form
                [ class "form-inline"
                , class "mx-2"
                , style "display" "inline"
                ]
                [ input
                    [ class "form-control"
                    , class "mr-sm-2"
                    , style "width" "75px"
                    , type_ "number"
                    , value (String.fromInt model.fontSize)
                    , onInput ChangeFontSize
                    ]
                    []
                ]
            ]
        , form [ class "form-inline" ]
            [ input
                [ class "form-control"
                , class "mr-sm-2"
                , placeholder "Search"
                , onInput ChangeSearch
                ]
                [ text model.search ]
            ]
        ]


view : Model -> Html Msg
view model =
    div []
        [ navBar model
        , div [ class "container-fluid" ]
            [ case model.fonts of
                Loading ->
                    div
                        [ class "alert"
                        , class "alert-info"
                        , class "m-5"
                        ]
                        [ text "Loading..."
                        , div [ class "progress" ]
                            [ div
                                [ class "progress-bar"
                                , class "progress-bar-striped"
                                , class "progress-bar-animated"
                                , class "bg-info"
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
        ]


port receiveFonts : (List String -> msg) -> Sub msg
