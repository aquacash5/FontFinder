port module Main exposing (main)

import Browser
import Html exposing (Html, button, div, form, h5, input, li, nav, p, span, text, ul)
import Html.Attributes exposing (class, classList, placeholder, style, type_, value)
import Html.Events exposing (onBlur, onClick, onInput)
import Paginate exposing (..)
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
    }


type FontList
    = Loading
    | Empty
    | Fonts (Paginate.PaginatedList String)


whenFonts : (Paginate.PaginatedList String -> Paginate.PaginatedList String) -> FontList -> FontList
whenFonts callback fontList =
    case fontList of
        Loading ->
            Loading

        Empty ->
            Empty

        Fonts fonts ->
            Fonts (callback fonts)


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
      }
    , Cmd.none
    )



-- UPDATE


type Msg
    = AddFonts (List String)
    | ChangeExample String
    | ChangeSearch String
    | ChangeFontSize String
    | ConfirmFontSize
    | TogglePresenter Presenter
    | AddSelectedFont String
    | RemoveSelectedFont String
    | SetFilterSelected Bool
    | ClearSelected
    | NextPage
    | PreviousPage
    | GoToIndex Int


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        AddFonts fontList ->
            if List.isEmpty fontList then
                ( { model | fonts = Empty }, Cmd.none )

            else
                ( { model | fonts = Fonts (Paginate.fromList 24 fontList) }, Cmd.none )

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
            ( { model | selected = Set.insert fontName model.selected }, Cmd.none )

        RemoveSelectedFont fontName ->
            ( { model | selected = Set.remove fontName model.selected }, Cmd.none )

        SetFilterSelected enabled ->
            ( { model | filterSelected = enabled }, Cmd.none )

        ClearSelected ->
            ( { model | selected = Set.empty, filterSelected = False }, Cmd.none )

        -- Pagination
        NextPage ->
            ( { model | fonts = whenFonts Paginate.next model.fonts }, Cmd.none )

        PreviousPage ->
            ( { model | fonts = whenFonts Paginate.prev model.fonts }, Cmd.none )

        GoToIndex index ->
            ( { model | fonts = whenFonts (Paginate.goTo index) model.fonts }, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    receiveFonts AddFonts



-- VIEW


filterFonts : Model -> Model
filterFonts model =
    case model.fonts of
        Loading ->
            model

        Empty ->
            model

        Fonts fonts ->
            let
                filter =
                    if model.filterSelected then
                        List.filter (isMember model.selected)

                    else
                        List.filter (caselessContains model.search)
            in
            { model | fonts = Fonts (Paginate.map filter fonts) }


caselessContains : String -> String -> Bool
caselessContains a b =
    let
        lowerA =
            String.toLower a

        lowerB =
            String.toLower b
    in
    String.contains lowerA lowerB


getFontStyle : Int -> String
getFontStyle size =
    if size == 0 then
        String.fromInt defaultFontSize ++ "px"

    else
        String.fromInt size ++ "px"


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
                        , style "font-family" font
                        , style "font-size" (getFontStyle model.fontSize)
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


alwaysTrue : a -> Bool
alwaysTrue _ =
    True


skipFilter : Bool -> (a -> Bool) -> (a -> Bool)
skipFilter skip predicate =
    if skip then
        predicate

    else
        alwaysTrue


isMember : Set.Set comparable -> comparable -> Bool
isMember set comp =
    Set.member comp set


pageItem : Msg -> String -> Html Msg
pageItem msg linkText =
    li [ class "page-item" ]
        [ button [ class "page-link", onClick msg ] [ text linkText ]
        ]


pagerOptions =
    { innerWindow = 1
    , outerWindow = 1
    , pageNumberView = pageNumberItem
    , gapView =
        li [ class "page-item", class "disabled" ]
            [ button [ class "page-link" ] [ text "..." ]
            ]
    }


pageNumberItem : Int -> Bool -> Html Msg
pageNumberItem index isActive =
    li [ classList [ ( "page-item", True ), ( "active", isActive ) ] ]
        [ button [ class "page-link", onClick (GoToIndex index) ] [ text (String.fromInt index) ]
        ]


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
                            ]
                        ]

                Empty ->
                    div [] [ text "No Fonts were found." ]

                Fonts fontList ->
                    div []
                        [ div [ class "row" ]
                            (List.map (renderFont model) <| Paginate.page fontList)
                        , div [ class "row", class "my-5" ]
                            [ div
                                [ class "col"
                                , class "d-flex"
                                , class "justify-content-center"
                                ]
                                [ nav []
                                    [ ul [ class "pagination" ]
                                        (pageItem PreviousPage "Previous"
                                            :: Paginate.elidedPager pagerOptions fontList
                                            ++ [ pageItem NextPage "Next" ]
                                        )
                                    ]
                                ]
                            ]
                        ]
            ]
        ]


port receiveFonts : (List String -> msg) -> Sub msg
