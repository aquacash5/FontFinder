port module Main exposing (main)

import Browser
import Html exposing (Html, button, div, form, h5, input, p, span, text)
import Html.Attributes exposing (attribute, class, classList, placeholder, style, type_, value)
import Html.Events exposing (onBlur, onClick, onInput)
import Set



-- MAIN


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , subscriptions = subscriptions
        , view = filterFonts >> view
        }



-- MODEL


defaultFontSize : Int
defaultFontSize =
    40


type alias Model =
    { fonts : FontList
    , search : String
    , example : String
    , fontSize : Int
    , bold : Bool
    , italic : Bool
    , filterSelected : Bool
    , selected : Set.Set String
    , averageHeight : Int
    }


type FontList
    = Loading
    | Percent Int
    | Empty
    | Fonts (List String)


type Presenter
    = Bold
    | Italic


init : () -> ( Model, Cmd Msg )
init _ =
    ( { fonts = Loading
      , example = ""
      , search = ""
      , fontSize = defaultFontSize
      , bold = False
      , italic = False
      , filterSelected = False
      , selected = Set.empty
      , averageHeight = 144
      }
    , Cmd.none
    )



-- UPDATE


type Msg
    = AddFonts (List String)
    | UpdateProgress Int
    | ChangeExample String
    | ChangeSearch String
    | ChangeFontSize String
    | ConfirmFontSize
    | TogglePresenter Presenter
    | AddSelectedFont String
    | ResetSelectedFonts (List String)
    | RemoveSelectedFont String
    | SetFilterSelected Bool
    | ClearSelected
    | SetAverageHeight Int


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        AddFonts fontList ->
            if List.isEmpty fontList then
                ( { model | fonts = Empty }, Cmd.none )

            else
                ( { model | fonts = Fonts fontList }, Cmd.none )

        UpdateProgress progress ->
            case model.fonts of
                Loading ->
                    ( { model | fonts = Percent progress }, Cmd.none )

                Percent _ ->
                    ( { model | fonts = Percent progress }, Cmd.none )

                Empty ->
                    ( model, Cmd.none )

                Fonts _ ->
                    ( model, Cmd.none )

        ChangeExample ex ->
            ( { model | example = ex }, Cmd.none )

        ChangeSearch ser ->
            ( { model | search = ser }, Cmd.none )

        ChangeFontSize strSize ->
            case String.toInt strSize of
                Nothing ->
                    ( { model | fontSize = 0 }, Cmd.none )

                Just size ->
                    ( { model | fontSize = size }, Cmd.none )

        ConfirmFontSize ->
            if model.fontSize <= 0 then
                ( { model | fontSize = defaultFontSize }, Cmd.none )

            else
                ( model, Cmd.none )

        TogglePresenter presenter ->
            case presenter of
                Bold ->
                    ( { model | bold = not model.bold }, Cmd.none )

                Italic ->
                    ( { model | italic = not model.italic }, Cmd.none )

        AddSelectedFont fontName ->
            let
                newSelectedSet =
                    Set.insert fontName model.selected
            in
            ( { model | selected = newSelectedSet }, saveSelected (Set.toList newSelectedSet) )

        ResetSelectedFonts fontNames ->
            ( { model | selected = Set.fromList fontNames }, Cmd.none )

        RemoveSelectedFont fontName ->
            let
                newSelectedSet =
                    Set.remove fontName model.selected
            in
            ( { model | selected = newSelectedSet }, saveSelected (Set.toList newSelectedSet) )

        ClearSelected ->
            let
                newSelectedSet =
                    Set.empty
            in
            ( { model | selected = newSelectedSet, filterSelected = False }, saveSelected (Set.toList newSelectedSet) )

        SetFilterSelected enabled ->
            ( { model | filterSelected = enabled }, Cmd.none )

        SetAverageHeight height ->
            ( { model | averageHeight = height }, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ receiveFonts AddFonts
        , receiveProgress UpdateProgress
        , receiveSelected ResetSelectedFonts
        ]



-- VIEW


filterFonts : Model -> Model
filterFonts model =
    case model.fonts of
        Loading ->
            model

        Empty ->
            model

        Percent _ ->
            model

        Fonts fonts ->
            let
                filter =
                    if model.filterSelected then
                        List.filter (isMember model.selected)

                    else
                        List.filter (caselessContains model.search)
            in
            { model | fonts = Fonts (filter fonts) }


caselessContains : String -> String -> Bool
caselessContains a b =
    let
        lowerA =
            String.toLower a

        lowerB =
            String.toLower b
    in
    String.contains lowerA lowerB


renderFont : Model -> String -> Html Msg
renderFont model font =
    let
        fontSelected =
            Set.member font model.selected

        toggleChecked =
            if fontSelected then
                RemoveSelectedFont font

            else
                AddSelectedFont font
    in
    div
        [ class "col-lg-4"
        , class "col-md-6"
        , class "col-12"
        , class "font-node"
        , attribute "data-node-type" "font-node"
        ]
        [ div
            [ classList
                [ ( "card", True )
                , ( "my-2", True )
                , ( "text-white", fontSelected )
                , ( "bg-info", fontSelected )
                ]
            ]
            [ div
                [ class "card-body"
                ]
                [ div
                    [ class "pt-0"
                    ]
                    [ h5
                        [ class "card-title"
                        , class "float-left"
                        ]
                        [ text font ]
                    , button
                        [ class "close"
                        , class "float-right"
                        , class "pl-3"
                        , class "pt-0"
                        , class "stretched-link"
                        , onClick toggleChecked
                        ]
                        [ span [ class "card-title" ] [ text "✓" ] ]
                    ]
                , div
                    [ class "mt-5"
                    ]
                    [ p
                        [ classList
                            [ ( "card-text", True )
                            , ( "font-weight-bold", model.bold )
                            , ( "font-italic", model.italic )
                            ]
                        , style "font-family" ("\"" ++ font ++ "\"")
                        ]
                        [ text
                            (if String.isEmpty model.example then
                                font

                             else
                                model.example
                            )
                        ]
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
                    , placeholder <| String.fromInt defaultFontSize
                    , value
                        (if model.fontSize == 0 then
                            ""

                         else
                            String.fromInt model.fontSize
                        )
                    , onInput ChangeFontSize
                    , onBlur ConfirmFontSize
                    ]
                    []
                ]
            , div [ class "btn-group" ]
                [ button
                    [ classList
                        [ ( "btn", True )
                        , ( "btn-info", model.filterSelected )
                        , ( "btn-outline-info", not model.filterSelected )
                        ]
                    , onClick (SetFilterSelected (not model.filterSelected && (Set.size model.selected > 0)))
                    ]
                    [ text "Filter Selected "
                    , span
                        [ classList
                            [ ( "badge", True )
                            , ( "badge-pill", True )
                            , ( "badge-light", model.filterSelected )
                            , ( "badge-info", not model.filterSelected )
                            ]
                        ]
                        [ text <| String.fromInt <| Set.size model.selected ]
                    ]
                , button
                    [ class "btn"
                    , class "btn-info"
                    , onClick ClearSelected
                    ]
                    [ text "Clear"
                    ]
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


isMember : Set.Set comparable -> comparable -> Bool
isMember set comp =
    Set.member comp set


view : Model -> Html Msg
view model =
    div []
        [ navBar model
        , div [ class "container-fluid" ]
            [ case model.fonts of
                Loading ->
                    div
                        [ class "row"
                        , class "justify-content-md-center"
                        ]
                        [ div
                            [ class "col-lg-6"
                            , class "col-md-8"
                            , class "col-sm-auto"
                            ]
                            [ div
                                [ class "alert"
                                , class "alert-info"
                                , class "m-5"
                                ]
                                [ text "Loading Fonts..."
                                , div [ class "progress" ]
                                    [ div
                                        [ class "progress-bar"
                                        , class "progress-bar-striped"
                                        , class "progress-bar-animated"
                                        , class "bg-info"
                                        , class "instant-time"
                                        , style "width" "100%"
                                        ]
                                        []
                                    ]
                                ]
                            ]
                        ]

                Percent progress ->
                    div
                        [ class "row"
                        , class "justify-content-md-center"
                        ]
                        [ div
                            [ class "col-lg-6"
                            , class "col-md-8"
                            , class "col-sm-auto"
                            ]
                            [ div
                                [ class "alert"
                                , class "alert-info"
                                , class "m-5"
                                ]
                                [ text "Loading Fonts..."
                                , div [ class "progress" ]
                                    [ div
                                        [ class "progress-bar"
                                        , class "progress-bar-striped"
                                        , class "progress-bar-animated"
                                        , class "bg-info"
                                        , classList [ ( "instant-time", progress < 1 ) ]
                                        , style "width" (String.fromInt progress ++ "%")
                                        ]
                                        []
                                    ]
                                ]
                            ]
                        ]

                Empty ->
                    div [] [ text "No Fonts were found." ]

                Fonts fontList ->
                    div
                        [ class "row"
                        , style "font-size" (String.fromInt model.fontSize ++ "px")
                        ]
                        (List.map (renderFont model) fontList)
            ]
        ]


port receiveFonts : (List String -> msg) -> Sub msg


port receiveProgress : (Int -> msg) -> Sub msg


port receiveSelected : (List String -> msg) -> Sub msg


port saveSelected : List String -> Cmd msg
