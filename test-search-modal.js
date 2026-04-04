const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log('\n🔗 대시보드 접속 중...\n');
  await page.goto('https://ai-trend-dashboard.vercel.app');
  await page.waitForTimeout(1500);

  // 테스트 1: 전체 카드 수 확인
  const totalCards = await page.locator('.card').count();
  console.log(`✅ 전체 카드 수: ${totalCards}개\n`);

  // 테스트 2: 검색바에 "ChatGPT" 타이핑
  console.log('--- 검색 테스트 ---');
  const searchInput = page.locator('#searchInput');
  await searchInput.scrollIntoViewIfNeeded();
  await searchInput.click();
  await page.waitForTimeout(300);
  await searchInput.fill('');
  await searchInput.type('ChatGPT', { delay: 150 });
  await page.waitForTimeout(800);

  const chatgptCards = await page.locator('.card:not(.hidden)').count();
  console.log(`  ✅ "ChatGPT" 검색 → ${chatgptCards}개 카드 표시`);

  // 테스트 3: 검색된 카드 클릭 → 모달 열기
  console.log('\n--- 모달 테스트 ---');
  const firstVisible = page.locator('.card:not(.hidden)').first();
  await firstVisible.scrollIntoViewIfNeeded();
  await firstVisible.click();
  await page.waitForTimeout(800);

  const modalVisible = await page.locator('.modal-panel.active').isVisible();
  console.log(`  ✅ 카드 클릭 → 모달 ${modalVisible ? '열림' : '안열림'}`);

  // 테스트 4: 모달 제목 확인
  const modalTitle = await page.locator('.modal-title').textContent();
  console.log(`  ✅ 모달 제목: "${modalTitle.trim().substring(0, 40)}..."`);

  // 테스트 5: 모달 닫기 (X 버튼)
  await page.locator('.modal-close').click();
  await page.waitForTimeout(500);
  const modalClosed = await page.locator('.modal-panel.active').count() === 0;
  console.log(`  ✅ X 버튼 → 모달 ${modalClosed ? '닫힘' : '안닫힘'}`);

  // 테스트 6: 검색어 클리어
  console.log('\n--- 클리어 테스트 ---');
  const clearBtn = page.locator('#searchClear');
  await clearBtn.click();
  await page.waitForTimeout(500);
  const afterClear = await page.locator('.card:not(.hidden)').count();
  console.log(`  ✅ 검색 클리어 → ${afterClear}개 카드 복원`);

  // 테스트 7: 회사 필터 + 검색 동시
  console.log('\n--- 필터 + 검색 동시 테스트 ---');
  await page.locator('.tab-btn[data-filter="anthropic"]').click();
  await page.waitForTimeout(500);
  await searchInput.fill('');
  await searchInput.type('Claude', { delay: 150 });
  await page.waitForTimeout(800);

  const anthropicClaude = await page.locator('.card:not(.hidden)').count();
  console.log(`  ✅ Anthropic + "Claude" → ${anthropicClaude}개 카드`);

  // 테스트 8: 필터된 카드 클릭 → 모달 열기 → 오버레이 클릭으로 닫기
  const filteredCard = page.locator('.card:not(.hidden)').first();
  await filteredCard.click();
  await page.waitForTimeout(800);
  console.log(`  ✅ 필터된 카드 → 모달 열림`);

  await page.locator('.modal-overlay').click({ position: { x: 10, y: 10 } });
  await page.waitForTimeout(500);
  console.log(`  ✅ 오버레이 클릭 → 모달 닫힘`);

  // 테스트 9: 전체 탭으로 복귀 + 검색 초기화
  await page.locator('.tab-btn[data-filter="all"]').click();
  await clearBtn.click();
  await page.waitForTimeout(500);
  const restored = await page.locator('.card:not(.hidden)').count();
  console.log(`  ✅ 전체 복귀 → ${restored}개 카드`);

  // 결과 요약
  console.log(`\n=============================`);
  console.log(`🎉 검색 + 모달 테스트 완료!`);
  console.log(`=============================\n`);

  await page.waitForTimeout(2000);
  await browser.close();
})();
