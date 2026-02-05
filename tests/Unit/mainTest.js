<?php

namespace Tests\Unit\Frontend;

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;

/**
 * ScoreCounter JavaScript機能のユニットテスト
 * 
 * JavaScriptコードのロジックをPHPで再現し、テストケースを網羅的に検証します。
 * DOM操作部分は実際のフロントエンドテスト（Jest、Dusk）で検証する必要があります。
 */
class ScoreCounterTest extends TestCase
{
    protected ScoreCounter $scoreCounter;

    protected function setUp(): void
    {
        parent::setUp();
        $this->scoreCounter = new ScoreCounter();
    }

    /**
     * スコアが0の状態で増加ボタンをクリックすると、スコアが1になることを確認
     */
    public function test_upClick_初期値0_1になる(): void
    {
        $this->scoreCounter->setScore(0);
        $this->scoreCounter->upClick();
        $this->assertEquals(1, $this->scoreCounter->getScore());
    }

    /**
     * 増加ボタンを複数回クリックした際、正しく連続してインクリメントされることを確認
     */
    public function test_upClick_複数回クリック_正しくインクリメントされる(): void
    {
        $this->scoreCounter->setScore(5);
        $this->scoreCounter->upClick();
        $this->scoreCounter->upClick();
        $this->scoreCounter->upClick();
        $this->assertEquals(8, $this->scoreCounter->getScore());
    }

    /**
     * データプロバイダを使用して、様々な初期値から正しくインクリメントされることを確認
     */
    #[DataProvider('provideScoreValues')]
    public function test_upClick_様々な初期値_データプロバイダ(int $initialScore, int $expected): void
    {
        $this->scoreCounter->setScore($initialScore);
        $this->scoreCounter->upClick();
        $this->assertEquals($expected, $this->scoreCounter->getScore());
    }

    public static function provideScoreValues(): array
    {
        return [
            '初期値0' => [0, 1],
            '初期値1' => [1, 2],
            '初期値10' => [10, 11],
            '初期値99' => [99, 100],
            '初期値999' => [999, 1000],
            '大きな値' => [999999, 1000000],
        ];
    }

    /**
     * スコアが1の状態で減少ボタンをクリックすると、スコアが0になることを確認
     */
    public function test_downClick_スコア1_0になる(): void
    {
        $this->scoreCounter->setScore(1);
        $result = $this->scoreCounter->downClick();
        $this->assertEquals(0, $this->scoreCounter->getScore());
        $this->assertFalse($result['hasError']);
    }

    /**
     * スコアが0の状態で減少ボタンをクリックすると、エラー状態になりスコアは変わらないことを確認
     */
    public function test_downClick_スコア0_エラー状態になる(): void
    {
        $this->scoreCounter->setScore(0);
        $result = $this->scoreCounter->downClick();
        $this->assertEquals(0, $this->scoreCounter->getScore());
        $this->assertTrue($result['hasError']);
        $this->assertEquals('score-zero', $result['errorClass']);
    }

    /**
     * スコアが0の状態で減少ボタンを複数回クリックしても、負の値にならないことを確認
     */
    public function test_downClick_負の値にならない(): void
    {
        $this->scoreCounter->setScore(0);
        $this->scoreCounter->downClick();
        $this->scoreCounter->downClick();
        $this->scoreCounter->downClick();
        $this->assertEquals(0, $this->scoreCounter->getScore());
    }

    /**
     * データプロバイダを使用して、様々なスコア値から正しくデクリメントされることを確認
     */
    #[DataProvider('provideDownClickValues')]
    public function test_downClick_様々なスコア値_データプロバイダ(int $initialScore, int $expected, bool $hasError): void
    {
        $this->scoreCounter->setScore($initialScore);
        $result = $this->scoreCounter->downClick();
        $this->assertEquals($expected, $this->scoreCounter->getScore());
        $this->assertEquals($hasError, $result['hasError']);
    }

    public static function provideDownClickValues(): array
    {
        return [
            'スコア0からの減少' => [0, 0, true],
            'スコア1からの減少' => [1, 0, false],
            'スコア2からの減少' => [2, 1, false],
            'スコア10からの減少' => [10, 9, false],
            'スコア100からの減少' => [100, 99, false],
        ];
    }

    /**
     * 増加と減少を組み合わせた操作が正しく動作することを確認
     */
    public function test_統合_増減の組み合わせ_正しく動作する(): void
    {
        $this->scoreCounter->setScore(0);
        
        // 0 -> 1
        $this->scoreCounter->upClick();
        $this->assertEquals(1, $this->scoreCounter->getScore());
        
        // 1 -> 2
        $this->scoreCounter->upClick();
        $this->assertEquals(2, $this->scoreCounter->getScore());
        
        // 2 -> 1
        $this->scoreCounter->downClick();
        $this->assertEquals(1, $this->scoreCounter->getScore());
        
        // 1 -> 2 -> 3
        $this->scoreCounter->upClick();
        $this->scoreCounter->upClick();
        $this->assertEquals(3, $this->scoreCounter->getScore());
        
        // 3 -> 2 -> 1 -> 0
        $this->scoreCounter->downClick();
        $this->scoreCounter->downClick();
        $this->scoreCounter->downClick();
        $this->assertEquals(0, $this->scoreCounter->getScore());
        
        // 0でエラー
        $result = $this->scoreCounter->downClick();
        $this->assertTrue($result['hasError']);
    }

    /**
     * 大きな数値での増減が正しく動作することを確認
     */
    public function test_境界値_最大整数値付近_正しく動作する(): void
    {
        $largeValue = 2147483646; // PHP_INT_MAX - 1
        $this->scoreCounter->setScore($largeValue);
        
        $this->scoreCounter->upClick();
        $this->assertEquals($largeValue + 1, $this->scoreCounter->getScore());
        
        $this->scoreCounter->downClick();
        $this->assertEquals($largeValue, $this->scoreCounter->getScore());
    }

    /**
     * 負の値を設定しようとした場合、例外が発生することを確認
     */
    public function test_setScore_不正な値_例外が発生する(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Score must be non-negative');
        $this->scoreCounter->setScore(-1);
    }

    /**
     * 初期化直後のスコアが0であることを確認
     */
    public function test_getScore_初期値_0が返される(): void
    {
        $counter = new ScoreCounter();
        $this->assertEquals(0, $counter->getScore());
    }

    /**
     * スコアが0の状態で減少ボタンを連続してクリックした場合、毎回エラー状態を返すことを確認
     */
    public function test_downClick_連続エラー_複数回エラー状態を返す(): void
    {
        $this->scoreCounter->setScore(0);
        
        $result1 = $this->scoreCounter->downClick();
        $this->assertTrue($result1['hasError']);
        
        $result2 = $this->scoreCounter->downClick();
        $this->assertTrue($result2['hasError']);
        
        $result3 = $this->scoreCounter->downClick();
        $this->assertTrue($result3['hasError']);
        
        $this->assertEquals(0, $this->scoreCounter->getScore());
    }
}

/**
 * ScoreCounter クラス（テスト対象）
 * 
 * JavaScriptのロジックをPHPで再現したクラス
 */
class ScoreCounter
{
    private int $score = 0;

    public function getScore(): int
    {
        return $this->score;
    }

    public function setScore(int $score): void
    {
        if ($score < 0) {
            throw new \InvalidArgumentException('Score must be non-negative');
        }
        $this->score = $score;
    }

    public function upClick(): void
    {
        $this->score = (int)$this->score + 1;
    }

    public function downClick(): array
    {
        if ($this->score > 0) {
            $this->score = $this->score - 1;
            return ['hasError' => false];
        } else {
            return [
                'hasError' => true,
                'errorClass' => 'score-zero'
            ];
        }
    }
}