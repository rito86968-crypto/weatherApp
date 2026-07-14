import './App.tsx'

type Props = {
    unit: "metric" | "imperial";
    setUnit: React.Dispatch<React.SetStateAction<"metric" | "imperial">>;
    city: string;
    setCity: React.Dispatch<React.SetStateAction<string>>;
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
};

function TopContent({ unit, setUnit, setCity, search, setSearch }: Props) {
    return (
        <main>
            <div className="topContent">
                <div className="searcher">
                    <img src="/Search.svg" alt="" />
                    <input
                        type="text"
                        placeholder="Search city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setCity(search);
                            }
                        }}
                    />
                </div>

                <div className="buttonPerformance">
                    <div
                        className={`toggle ${unit === "metric" ? "metric" : "imperial"}`}
                        onClick={() =>
                            setUnit(unit === "metric" ? "imperial" : "metric")
                        }
                    >
                        <span className="UnitPlacement">
                            <p>°C</p>
                            <p>°F</p>
                        </span>

                        <div className="circle">
                            <p>{unit === "metric" ? "°F" : "°C"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default TopContent;