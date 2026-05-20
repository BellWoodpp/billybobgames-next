extends Node2D

@onready var click_label = $UI / ClickLabel
@onready var dust = $UI / DustParticles
@onready var cat = $Jjaemu / Sprite2D
@onready var brush = $UI / Brush
@onready var boom_sound = $BoomSound
@onready var gameover_bg_sound = $GameOverBackgroundSound
@onready var attack_sound = $AttackSound
@onready var button_sound = $ButtonSound
@onready var dust_sound = $DustSound

@onready var score_label = $UI / ScoreLabel
@onready var gameover_label = $UI / GameOverLabel
@onready var gameover_bg = $UI / GameOverBackground
@onready var final_score_label = $UI / FinalScoreLabel

@onready var effect_sprite = $EffectSprite

var dust_players: Array[AudioStreamPlayer] = []

var brush_base_scale: float = 1.0
var dust_sound_cooldown: float = 0.0
var dust_sound_interval: float = 0.1

var gameover_scale_time: float = 0.0
var gameover_scaling: bool = false
var gameover_scale_duration: float = 0.4

var score_waiting: bool = false
var score_first_move: bool = true
var restart_clicked: bool = false
var score_move_target: Vector2
var score_move_start: Vector2
var score_move_time: float = 0.0
var score_move_duration: float = 0.0

var score_wait_time: float = 0.0
var score_wait_timer: float = 0.0
var score_moving: bool = false

var click_blink_delay: float = 0.0
var click_blink_delay_time: float = 0.3
var click_blink_started: bool = false
var click_blink_time: float = 0.0

var brushing_move: bool = false
var move_threshold: float = 30.0

var gameover_fade_time: float = 0.0
var gameover_fading_in: bool = false
var gameover_fade_duration: float = 1.5

var last_mouse_pos: Vector2
var brush_speed: float = 0.0

var brush_idle_rotation: float = deg_to_rad(90.0)
var brush_brush_rotation: float = deg_to_rad(60.0)

var click_times: Array[float] = []
var click_window: float = 2.0

var breath_timer: float = 0.0
var breath_duration: float = 2.5
var breath_strength: float = 0.01

var state: int = 0
var brushing: bool = false

var score_time: float = 0.0
var difficulty: float = 0.0

var angry_wait_time: float = 0.0
var angry_timer_active: bool = false
var angry_elapsed: float = 0.0

var pet_timer: float = 0.0

var fade_time: float = 0.0
var fading: bool = false
var can_restart: bool = false

var gameover_delay: float = 0.0
var gameover_waiting: bool = false

var effect_delay: float = 0.1
var effect_delay_timer: float = 0.0
var effect_waiting: bool = false

var effect_time: float = 0.0
var effect_playing: bool = false

var effect_pivot: Vector2
var effect_pivot_ratio: Vector2 = Vector2(0.05, -0.055)
var effect_origin_pos: Vector2
var effect_origin_scale: Vector2

var cat_origin_scale: Vector2

var is_dragging: bool = false

var dust_distance_accum: float = 0.0
var dust_step: float = 600.0

var cat_idle = preload("res://art/jjaemu_1.PNG")
var cat_angry = preload("res://art/jjaemu_2.PNG")
var cat_attack = preload("res://art/jjaemu_3.PNG")

func _ready():
    gameover_bg_sound.stream.loop = true
    brush_base_scale = brush.scale.x
    click_label.visible = false
    click_label.modulate.a = 0.0
    last_mouse_pos = get_global_mouse_position()
    cat_origin_scale = cat.scale
    brush.rotation = brush_idle_rotation

    breath_duration = randf_range(2.0, 4.5)
    breath_strength = randf_range(0.005, 0.015)

    gameover_label.visible = false
    gameover_bg.visible = false
    final_score_label.visible = false

    gameover_label.modulate.a = 0.0
    gameover_bg.modulate.a = 0.0
    final_score_label.modulate.a = 0.0

    effect_sprite.visible = false
    effect_sprite.centered = true

    effect_origin_pos = effect_sprite.position
    effect_origin_scale = effect_sprite.scale

    cat.texture = cat_idle


    Input.set_mouse_mode(Input.MOUSE_MODE_HIDDEN)

    for i in 5:
        var p: AudioStreamPlayer = AudioStreamPlayer.new()
        add_child(p)
        p.stream = dust_sound.stream
        p.volume_db = dust_sound.volume_db
        dust_players.append(p)

func _process(delta: float):
    var mouse_pos: Vector2 = get_global_mouse_position()
    var screen_size: Vector2 = get_viewport_rect().size

    var mouse_inside: bool = (
        mouse_pos.x >= 0.0 and mouse_pos.x <= screen_size.x and 
        mouse_pos.y >= 0.0 and mouse_pos.y <= screen_size.y
    )

    if mouse_inside == true:
        dust.global_position = mouse_pos

    dust_sound_cooldown -= delta

    var dist: float = mouse_pos.distance_to(last_mouse_pos)

    brush_speed = dist / max(delta, 0.0001)
    last_mouse_pos = mouse_pos

    _update_brushing(delta, mouse_inside)

    if brushing_move == true and state != 2:
        dust_distance_accum += dist

        while dust_distance_accum >= dust_step:
            if dust_sound_cooldown <= 0.0:
                play_dust_sound()
                dust_sound_cooldown = dust_sound_interval

            dust_distance_accum -= dust_step
    else:
        dust_distance_accum = 0.0

    var max_score: float = 120.0
    var t_diff: float = clamp(score_time / max_score, 0.0, 1.0)
    difficulty = pow(t_diff, 1.0)

    var now: float = Time.get_ticks_msec() / 1000.0

    while click_times.size() > 0 and now - click_times[0] > click_window:
        click_times.pop_front()

    var threshold: int = int(lerp(4.0, 4.0, difficulty))
    if click_times.size() >= threshold:
        if state != 2:
            _trigger_attack()

    _update_gameover_scale(delta)
    _update_brush_position(delta)
    _update_pet_timer(delta)
    _update_angry_timer(delta)
    _update_effect_delay(delta)
    _update_effect(delta)
    _update_timers(delta)
    _update_fade(delta)
    _update_idle_breath(delta)
    _update_gameover_sound_fade(delta)

    if brushing_move == true and state != 2:
        var max_speed: float = 2500.0
        var t: float = clamp(brush_speed / max_speed, 0.0, 1.0)
        t = pow(t, 5.0)
        dust.amount_ratio = t

        var min_speed: float = 40.0

        if brush_speed > min_speed:
            var score_t: float = clamp(brush_speed / max_speed, 0.0, 1.0)
            score_t = pow(score_t, 3.5)
            score_time += delta * score_t * 8.0
    else:
        dust.amount_ratio = 0.0

    score_label.text = str(int(score_time))


    if final_score_label.visible == true:
        if score_moving == true:
            score_move_time += delta

            var t_move: float = clamp(score_move_time / score_move_duration, 0.0, 1.0)
            final_score_label.position = score_move_start.lerp(score_move_target, t_move)

            if t_move >= 1.0:
                score_moving = false
                score_wait_timer = 0.0
                score_wait_time = randf_range(0.3, 2.0)
                score_waiting = true
        else:
            if score_waiting == true:
                score_wait_timer += delta

                if score_wait_timer >= score_wait_time:
                    score_waiting = false
                    _start_score_move()


    if click_label.visible == true and can_restart == true:
        if click_blink_started == false:
            click_blink_started = true

            var current_alpha: float = click_label.modulate.a
            var normalized: float = (current_alpha - 0.3) / (1.0 - 0.3)
            normalized = clamp(normalized, 0.0, 1.0)

            click_blink_time = asin(normalized * 2.0 - 1.0) / 4.0
        else:
            click_blink_time += delta

            var t_blink: float = (sin(click_blink_time * 4.0) + 1.0) * 0.5
            var alpha: float = lerp(0.0, 1.0, t_blink)

            click_label.modulate.a = alpha

func _update_brush_position(delta: float):
    var mouse_pos: Vector2 = get_global_mouse_position()
    brush.global_position = mouse_pos

    var mouse_pressed: bool = Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT)


    var target_scale: float = brush_base_scale

    if mouse_pressed == true:
        target_scale = brush_base_scale * 0.8
    else:
        target_scale = brush_base_scale

    var current_scale: float = brush.scale.x
    var new_scale: float = lerp(current_scale, target_scale, delta * 10.0)

    brush.scale = Vector2(new_scale, new_scale)




    var target_rot: float = brush_idle_rotation

    if mouse_pressed == true:
        target_rot = brush_brush_rotation
    else:
        target_rot = brush_idle_rotation

    var current_rot: float = brush.rotation
    var new_rot: float = lerp(current_rot, target_rot, delta * 22.0)

    brush.rotation = new_rot

func _input(event):
    if event is InputEventMouseButton:
        if event.button_index == MOUSE_BUTTON_LEFT:

            if event.pressed == true:
                var now: float = Time.get_ticks_msec() / 1000.0
                click_times.append(now)

                if can_restart == true and restart_clicked == false:
                    restart_clicked = true
                    button_sound.pitch_scale = 10.0
                    button_sound.play()

            if event.pressed == false and can_restart == true:
                if restart_clicked == true:
                    _restart_game()

func _update_brushing(delta: float, mouse_inside: bool):
    if state == 2:
        brushing = false
        brushing_move = false
        dust.emitting = false
        return

    var mouse_pressed: bool = Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT)
    var move_threshold: float = 30.0
    var moving: bool = brush_speed > move_threshold


    if mouse_pressed == true:
        if brushing == false:
            var min_t: float = lerp(0.2, 0.01, difficulty)
            var max_t: float = lerp(2.2, 1.8, difficulty)
            pet_timer = randf_range(min_t, max_t)

        brushing = true
    else:
        brushing = false


    if mouse_inside == true and mouse_pressed == true:
        brushing_move = true
    else:
        brushing_move = false

    dust.emitting = brushing_move


    if mouse_inside == true and state == 1:
        var angry_min_speed: float = 20.0

        if brush_speed > angry_min_speed:
            var attack_delay: float = lerp(0.6, 0.2, difficulty)

            var min_delay: float = 0.2
            attack_delay = max(attack_delay, min_delay)

            if angry_elapsed >= attack_delay:
                _trigger_attack()

func _update_pet_timer(delta: float):
    if state == 0 and brushing == true:
        var min_speed: float = 20.0

        if brush_speed > min_speed:
            pet_timer -= delta

            if pet_timer <= 0.0:
                _enter_angry_state()

func _enter_angry_state():
    state = 1
    cat.texture = cat_angry

    if boom_sound.playing == false:
        boom_sound.play()

    var min_t: float = lerp(1.2, 0.8, difficulty)
    var max_t: float = lerp(3.0, 2.5, difficulty)
    angry_wait_time = randf_range(min_t, max_t)

    angry_timer_active = true
    angry_elapsed = 0.0

func _update_angry_timer(delta: float):
    if angry_timer_active == true:
        angry_wait_time -= delta

        var min_speed: float = 20.0


        if brush_speed > min_speed:
            angry_elapsed += delta

        if angry_wait_time <= 0.0:
            angry_timer_active = false
            if state == 1:
                state = 0
                cat.texture = cat_idle
                angry_elapsed = 0.0

                pet_timer = randf_range(0.5, 2.0)

func _trigger_attack():
    if state == 2:
        return

    state = 2
    angry_timer_active = false

    effect_delay_timer = 0.0
    effect_waiting = true

    gameover_waiting = true
    gameover_delay = 0.4

func _update_effect_delay(delta: float):
    if effect_waiting == true:
        effect_delay_timer += delta

        if effect_delay_timer >= effect_delay:
            effect_waiting = false
            _start_effect()

func _start_effect():
    cat.texture = cat_attack

    if attack_sound.playing == false:
        attack_sound.play()

    effect_sprite.visible = true
    effect_time = 0.0
    effect_playing = true

    effect_sprite.position = effect_origin_pos
    effect_sprite.scale = effect_origin_scale

    var size: Vector2 = effect_sprite.texture.get_size()

    effect_pivot = Vector2(
        size.x * effect_pivot_ratio.x, 
        size.y * effect_pivot_ratio.y
    )

func _update_effect(delta: float):
    if effect_playing == true:
        effect_time += delta

        var t: float = clamp(effect_time / 0.8, 0.0, 1.0)
        t = 1.0 - pow(1.0 - t, 2.0)

        var scale_value: float = lerp(1.0, 3.5, t)
        var final_scale: Vector2 = effect_origin_scale * scale_value
        effect_sprite.scale = final_scale

        var pivot_offset: Vector2 = effect_pivot * (scale_value - 1.0)
        effect_sprite.position = effect_origin_pos - pivot_offset

        if t >= 1.0:
            effect_playing = false

func _update_timers(delta: float):
    if gameover_waiting == true:
        gameover_delay -= delta

        if gameover_delay <= 0.0:
            gameover_waiting = false

            fading = true
            fade_time = 0.0

            gameover_bg.visible = true
            gameover_label.visible = true
            final_score_label.visible = true

            final_score_label.text = "Score: " + str(int(score_time))

            gameover_label.scale = Vector2(0.8, 0.8)
            gameover_scale_time = 0.0
            gameover_label.pivot_offset = gameover_label.size * 0.5

            if gameover_bg_sound.playing == false:
                gameover_bg_sound.volume_db = -40.0
                gameover_bg_sound.play()

                gameover_fade_time = 0.0
                gameover_fading_in = true

func _update_fade(delta: float):
    if fading == true:
        fade_time += delta

        var bg_t: float = clamp(fade_time / 0.8, 0.0, 1.0)
        gameover_bg.modulate.a = bg_t

        var text_t: float = clamp((fade_time - 0.8) / 1.5, 0.0, 1.0)
        gameover_label.modulate.a = text_t

        var score_t: float = clamp((fade_time - 1.1) / 0.7, 0.0, 1.0)
        final_score_label.modulate.a = score_t

        var click_t: float = clamp((fade_time - 1.8) / 1.0, 0.0, 1.0)
        click_label.visible = true
        click_label.modulate.a = click_t


        if score_t >= 1.0:
            can_restart = true

        if score_t >= 1.0 and score_first_move == true:
            score_first_move = false
            score_wait_timer = 0.0
            score_wait_time = 0.5
            score_waiting = true

        if click_t >= 1.0:
            fading = false

            click_blink_time = 0.0
            click_blink_delay = 0.0
            click_blink_started = false

func _update_idle_breath(delta: float):
    if state != 0:
        cat.scale = cat_origin_scale
        cat.offset = Vector2(0.0, 0.0)
        breath_timer = 0.0
        return

    breath_timer += delta

    if breath_timer >= breath_duration:
        breath_timer = 0.0
        breath_duration = randf_range(2.0, 4.0)

    var t: float = breath_timer / breath_duration
    var smooth_t: float = t * t * (3.0 - 2.0 * t)
    var breath: float = sin(smooth_t * PI) * breath_strength

    var scale_y: float = cat_origin_scale.y * (1.0 + breath)
    cat.scale = Vector2(cat_origin_scale.x, scale_y)

    var texture_height: float = cat.texture.get_size().y
    var offset_y: float = texture_height * (scale_y / cat_origin_scale.y - 1.0)

    cat.offset = Vector2(0.0, - offset_y * 0.5)

func _update_gameover_sound_fade(delta: float):
    if gameover_fading_in == true:
        gameover_fade_time += delta

        var t: float = clamp(gameover_fade_time / gameover_fade_duration, 0.0, 1.0)
        t = t * t

        var volume: float = lerp(-40.0, -10.0, t)
        gameover_bg_sound.volume_db = volume

        if t >= 1.0:
            gameover_fading_in = false

func play_dust_sound():
    for p in dust_players:
        if p.playing == false:
            p.pitch_scale = randf_range(0.9, 1.1)
            p.play()
            break

func _restart_game():
    if gameover_bg_sound.playing == true:
        gameover_bg_sound.stop()

    await get_tree().create_timer(0.2).timeout
    get_tree().reload_current_scene()

func _start_score_move():
    score_move_start = final_score_label.position

    var angle: float = randf_range(0.0, TAU)
    var distance: float = randf_range(30.0, 50.0)

    var dir: Vector2 = Vector2(cos(angle), sin(angle))
    var target: Vector2 = score_move_start + dir * distance

    var screen_size: Vector2 = get_viewport_rect().size
    var margin: float = 40.0

    target.x = clamp(target.x, margin, screen_size.x - margin)
    target.y = clamp(target.y, margin, screen_size.y - margin)

    score_move_target = target

    var speed: float = 80.0
    var dist: float = score_move_start.distance_to(score_move_target)

    score_move_duration = dist / speed
    score_move_time = 0.0

    score_moving = true

func _update_gameover_scale(delta: float):
    if gameover_label.visible == true:
        gameover_scale_time += delta

        var speed: float = 0.8
        var t: float = (sin(gameover_scale_time * speed) + 1.0) * 0.5

        var min_scale: float = 1.0
        var max_scale: float = 1.1

        var s: float = lerp(min_scale, max_scale, t)
        gameover_label.scale = Vector2(s, s)
