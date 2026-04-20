import { useRef, useEffect, useCallback } from 'react';

const ITEM_HEIGHT = 48;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2);

export default function DrumPicker({ items, value, onChange }) {
  const scrollRef = useRef(null);
  const selectedIndex = Math.max(0, items.indexOf(value));

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = selectedIndex * ITEM_HEIGHT;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSettled = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    onChange(items[clamped]);
  }, [items, onChange]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let timer;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(onSettled, 120);
    };

    if ('onscrollend' in el) {
      el.addEventListener('scrollend', onSettled);
      return () => el.removeEventListener('scrollend', onSettled);
    } else {
      el.addEventListener('scroll', onScroll);
      return () => { el.removeEventListener('scroll', onScroll); clearTimeout(timer); };
    }
  }, [onSettled]);

  const handleItemClick = (index) => {
    scrollRef.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
  };

  const paddedItems = [...Array(PAD).fill(null), ...items, ...Array(PAD).fill(null)];

  return (
    <div className="drum-wrapper">
      <div className="drum-highlight-bar" style={{ top: PAD * ITEM_HEIGHT, height: ITEM_HEIGHT }} />
      <div className="drum-fade-top" />
      <div
        ref={scrollRef}
        className="drum-scroll"
        style={{ height: VISIBLE * ITEM_HEIGHT }}
      >
        {paddedItems.map((item, i) => {
          const realIndex = i - PAD;
          const isSelected = item === value;
          const isPad = item === null;
          return (
            <div
              key={i}
              className={`drum-item${isSelected ? ' drum-item-selected' : ''}${isPad ? ' drum-item-pad' : ''}`}
              style={{ height: ITEM_HEIGHT }}
              onClick={() => !isPad && handleItemClick(realIndex)}
            >
              {item ?? ''}
            </div>
          );
        })}
      </div>
      <div className="drum-fade-bottom" />
    </div>
  );
}
