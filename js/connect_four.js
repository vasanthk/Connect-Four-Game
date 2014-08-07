/**
 * Connect Four game using only HTML/CSS/Javascript
 * @author: Vasanth Krishnamoorthy
 */

var BOARD_COLS = 7,
	BOARD_ROWS = 6;

var board = {
	// Intitialize player/board info
	init: function () {
		this.dimensions = {
			'cols': BOARD_COLS,
			'rows': BOARD_ROWS,
			'length': BOARD_COLS * BOARD_ROWS
		};
		this.player_one = 'Player 1';
		this.player_two = 'Player 2';
		this.build_board();
	},

	// Build Board HTML
	build_board: function () {
		// Build the board
		var container = $('#grid'),
			row = '';
		container.html('');
		for (var i = 0; i < this.dimensions.rows; i++) {
			row = "<ul class='board'>" + repeat("<li><span></span></li>", this.dimensions.cols) + "</ul>";
			container.append(row);
		}

		// Repeat string function (Performance optimized)
		function repeat(str, count) {
			var output = '';
			for (; ;) {
				if (count & 1) output += str;
				count >>= 1;
				if (count) str += str;
				else break;
			}
			return output;
		}
	},

	// Get position of item
	get_position: function (item) {
		var curr_item = $(item),
			parent = curr_item.parent().children('li');
		return parent.index(curr_item);
	},

	// Get bottom free slot's position in current column.
	get_bottom: function (item) {
		return game.get_bottom(this.get_position(item));
	},

	// Display Success Message to user
	display_msg: function () {
		var winner_name = '';
		if (game.winning === 'black') {
			winner_name = board.player_one;
		} else {
			winner_name = board.player_two;
		}
		if (game.winning != '') {
			game.gameOverSound.play();
			var play_again = confirm(winner_name + " won! Play again?");
			if (play_again) {
				game.reset();
				board.clear();
			}
		}
	},

	// Clear board
	clear: function () {
		$('ul.board li span').removeClass();
	}
};

var game = {

	// Initialize board settings/dimensions
	init: function (dimensions) {
		this.board = [];
		this.dimensions = dimensions;
		this.reset();
		this.audio();
	},

	// Reset board when game over.
	reset: function () {
		this.last_play = undefined;
		this.turn = 'black';
		this.winning = '';
		this.winning_pieces = [];
		for (var i = 0; i < this.dimensions.length; i++) {
			this.board[i] = '';
		}
	},

	// Add Audio elements
	audio: function () {
		this.pieceDropSound = document.createElement('audio');
		this.pieceDropSound.setAttribute('src', 'audio/piece_drop.mp3');
		this.pieceDropSound.load();

		this.gameOverSound = document.createElement('audio');
		this.gameOverSound.setAttribute('src', 'audio/game_over.wav');
		this.gameOverSound.load();
	},

	// Switch turns after play
	switch_turns: function () {
		this.turn = (this.turn === 'black') ? 'red' : 'black';
	},

	// Check if winner
	is_winner: function (x, y) {
		var current = this.last_play,
			check = this.board[current],
			complete = false,
			reversed = false,
			reverse = false,
			consecutive = 0;
		while (!complete) {
			// Check for 4 consecutive connected items with same color.
			if (this.board[current] == check) {
				this.winning_pieces[consecutive] = current;
				consecutive++;
				if (consecutive == 4) {
					return true;
				}
				reverse = false;
			} else {
				reverse = true;
			}

			if ((x > 0 && ((current + 1) % (this.dimensions.cols) == 0)) || // Check if the current x is the last column
				(x < 0 && (current % this.dimensions.cols == 0)) ||	// Check if the current x is the first column
				(y > 0 && ((current + (y * this.dimensions.cols)) > this.board.length)) || // Check if the current y is the last row
				(y < 0 && ((current + (y * this.dimensions.cols)) < 0))) { // Check if the current y is the first row
				reverse = true;
			}

			if (reverse) {
				if (reversed) {
					complete = true;
					break;
				} else {
					reversed = true;
					current = this.last_play;
					x *= -1;
					y *= -1;
				}
			}
			current = current + x + (y * this.dimensions.cols);
		}
		return false;
	},

	// Check winning combinations.
	check_winner: function () {
		/// Check for winning values
		if (this.is_winner(0, 1) || this.is_winner(1, 1) || this.is_winner(1, 0) || this.is_winner(1, -1)) {
			this.winning = this.turn;
		}
	},

	// Check if valid move to play
	can_play: function (col) {
		/// Check if a column is valid for making a move on.
		return (this.get_bottom(col) != undefined);
	},

	// Get bottom available slot in the column
	get_bottom: function (col) {
		// Returns the next available slot in a column
		var bottom = undefined;
		if (this.winning == '' && col >= 0 && col < this.dimensions.cols) {
			var last_check = (this.board.length - (this.dimensions.cols - (col + 1)));
			for (var i = col; i <= last_check; i += this.dimensions.cols) {
				if (this.board[i] == '')
					bottom = i;
			}
		}

		return bottom;
	},

	// Check Play
	play: function (col) {
		this.pieceDropSound.play();

		if (this.winning != '')
			return false;

		if (col >= this.dimensions.cols || col < 0)
			return false;

		var bottom = this.get_bottom(col);
		if (bottom != undefined) {
			this.board[bottom] = this.turn;
			this.last_play = bottom;
			this.check_winner();

			if (this.winning == '')
				this.switch_turns();

			// This column was successfully played by this turn
			return true;
		}

		// This column is not playable.
		return false;
	},

	// Event listeners on grid elements based on user actions
	event_listeners: function () {
		var $drop_area = $('#drop-area').find('span'),
			animating = false;

		$("ul.board li")
			.on({
				mouseenter: function () {
					var bottom = board.get_bottom(this);
					if (bottom != undefined) {
						if (!animating) {
							var n = bottom % 7;
							$drop_area.css('left', n * 66 + 11);
							$($('ul.board li span')[bottom]).addClass(game.turn + "_hover");
						}
					}
				},
				mouseleave: function () {
					var bottom = board.get_bottom(this);
					if (bottom != undefined) {
						$($('ul.board li span')[bottom]).removeClass(game.turn + "_hover");
					}
				}
			})
			.on('click', function () {
				var index = board.get_position(this),
					bottom = game.get_bottom(index);
				if (bottom != undefined && !animating) {
					var row = Math.ceil((bottom + 1) / 7),
						position = row * 75,
						duration = row * 80 + 150;
					animating = true;
					$drop_area.animate({
						top: position
					}, {
						duration: duration,
						easing: 'easeOutBounce',
						complete: function () {
							$drop_area.hide("slow", function () {
								$(this).css({top: '0px'});
								setTimeout(function () {
									$drop_area.removeClass().addClass(game.turn + '_hover').show();
									animating = false;
								}, 200);
							});
						}
					});

					var piecePlayed = $("ul.board li span")[bottom];
					$(piecePlayed).removeClass(game.turn + '_hover').addClass(game.turn);
					game.play(index);
					if (game.winning != '') {
						var $winning_pieces = $("ul.board li span").map(function (index, element) {
							if ($.inArray(index, game.winning_pieces) > -1)
								return element;
						});
						$winning_pieces.addClass(game.winning + '_winner');
						board.display_msg();
					}
				}
			});
	}
};

// Start by initializing the board layout
$(function () {
	board.init();
	game.init(board.dimensions);
	game.event_listeners();
});

// jQuery easing
jQuery.extend(jQuery.easing, {
	easeOutBounce: function (x, t, b, c, d) {
		if ((t /= d) < (1 / 2.75)) {
			return c * (7.5625 * t * t) + b;
		} else if (t < (2 / 2.75)) {
			return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
		} else if (t < (2.5 / 2.75)) {
			return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
		} else {
			return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
		}
	}
});


