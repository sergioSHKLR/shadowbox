      <div className={`${pane("case")} view-case`}><Case rows={rows} onOpen={open} /></div>
      <div className={pane("uniforms")}><Uniforms onOpen={open} /></div>
      <div className={pane("decorations")}><Decorations onOpen={open} tour={tour} /></div>
      <div className={pane("timeline")}><Timeline bars={bars} rows={rows} blanks={blanks} onOpen={open} onFocus={focusTour} /></div>
      <div className={pane("equipment")}><EquipmentView onOpen={open} /></div>
      <div className={pane("map")}><Stations stops={stops} onOpen={open} /></div>
      <div className={`${pane("sources")} no-book`}><Sources /></div>
      <div className={`${pane("contact")} no-book`}><Contact onOpenBook={() => setView("guestbook")} /></div>
      <div className={`${pane("guestbook")} no-book`}><Guestbook /></div>