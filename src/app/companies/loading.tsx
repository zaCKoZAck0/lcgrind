export default function SheetPageLoading() {
    return (
        <div className="min-h-screen flex flex-col items-center w-full">
            <h1 className="md:text-5xl text-3xl font-bold p-12">All Companies</h1>
            <div className="p-8 w-full h-full items-center justify-center text-center text-muted-foreground/50">
                <p>Loading Companies ...</p>
            </div>
        </div>
    );
}