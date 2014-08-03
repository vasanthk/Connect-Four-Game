describe("Connect Four game", function () {

	beforeEach(function () {
		var dimensions = {'rows': 6, 'cols': 7, 'length': 42};
		game.init(dimensions);
	});

	it("Should reset to empty board", function () {
		game.reset();
		for (var i = 0; i < game.board.length; i++) {
			var result = game.board[i];
			expect(result).toEqual('');
		}
	});

	it("Should return the correct free bottom slot in a column", function () {
		var bottom = game.get_bottom(3);
		expect(bottom).toEqual(38);
	});

	it("Should be able to check if play possible on the board now", function () {
		expect(game.can_play(0)).toEqual(true);
	});

	it("Should switch turns when someone has played", function () {
		expect(game.turn).toEqual('black');
		expect(game.play(0)).toEqual(true);
		expect(game.turn).toEqual('red');
	});

	it("Should not allow a play on a completed column", function () {
		expect(game.last_play).toEqual(undefined);
		for (var i = 0; i < game.dimensions.rows; i++) {
			expect(game.play(0)).toEqual(true);
		}
		expect(game.play(0)).toEqual(false);
		expect(game.last_play).toEqual(0);
	});

	it("Should be able to detect a vertical win and stop play", function () {
		for (var i = 0; i < 3; i++) {
			game.play(0);
			game.play(1);
			expect(game.winning).toEqual('');
		}
		expect(game.play(0)).toEqual(true);
		expect(game.winning).toEqual('black');
		expect(game.play(1)).toEqual(false);
	});

	it("should be able to detect a horizontal win and stop play", function () {
		for (var i = 0; i < 3; i++) {
			game.play(i);
			game.play(i);
			expect(game.winning).toEqual('');
		}
		expect(game.play(3)).toEqual(true);
		expect(game.winning).toEqual('black');
		expect(game.play(3)).toEqual(false);
	});

	it("Should be able to detect a right-angled diagonal win and stop play", function () {
		simulatePlay(0, 4);
		simulatePlay(1, 4);
		game.play(3);
		game.play(2);
		game.play(2);
		expect(game.play(3)).toEqual(true);
		expect(game.winning).toEqual('black');
		expect(game.play(3)).toEqual(false);
	});

	it("Should be able to detect a left-angled diagonal win and stop play", function () {
		simulatePlay(0, 4);
		simulatePlay(1, 3);
		game.play(0);
		game.play(1);
		game.play(0);
		expect(game.play(0)).toEqual(true);
		expect(game.winning).toEqual('red');
		expect(game.play(0)).toEqual(false);
	});

	it("Should reset game when selected after game is over", function () {
		simulatePlay(0, 4);
		simulatePlay(1, 3);
		game.play(0);
		game.play(1);
		game.play(0);
		expect(game.play(0)).toEqual(true);
		expect(game.winning).toEqual('red');
		expect(game.get_bottom(0)).toEqual(undefined);
		expect(game.last_play).not.toEqual(undefined);
		game.reset();
		expect(game.winning).toEqual('');
		expect(game.turn).toEqual('black');
		expect(game.get_bottom(0)).not.toEqual(undefined);
		expect(game.last_play).toEqual(undefined);
	});
});

function simulatePlay(offset, x) {
	for (var i = offset; i < x; i++) {
		game.play(i);
	}
}
